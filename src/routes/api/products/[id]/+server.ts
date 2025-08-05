// src/routes/api/products/[id]/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            saleItems: true,
            purchaseItems: true
          }
        }
      }
    });

    if (!product) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    return json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            saleItems: true,
            purchaseItems: true
          }
        }
      }
    });

    if (!product) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has been used in sales or purchases
    if (product._count.saleItems > 0 || product._count.purchaseItems > 0) {
      return json({ 
        error: 'Cannot delete product that has been used in sales or purchases' 
      }, { status: 400 });
    }

    // Delete related inventory history first
    await prisma.inventoryHistory.deleteMany({
      where: { productId: id }
    });

    // Delete the product
    await prisma.product.delete({
      where: { id }
    });

    return json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return json({ error: 'Failed to delete product' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.nameEn || !data.nameAr || !data.sku) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if SKU already exists (excluding current product)
    if (data.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku: data.sku,
          id: { not: id }
        }
      });

      if (existingSku) {
        return json({ error: 'SKU already exists' }, { status: 400 });
      }
    }

    // Check if barcode already exists (excluding current product)
    if (data.barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { 
          barcode: data.barcode,
          id: { not: id }
        }
      });

      if (existingBarcode) {
        return json({ error: 'Barcode already exists' }, { status: 400 });
      }
    }

    // Get current product for inventory tracking
    const currentProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!currentProduct) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        sku: data.sku,
        barcode: data.barcode || null,
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        costPrice: parseFloat(data.costPrice) || 0,
        sellingPrice: parseFloat(data.sellingPrice) || 0,
        categoryId: data.categoryId || null,
        location: data.location || null
      },
      include: {
        category: true
      }
    });

    // Log inventory history if quantity changed
    if (currentProduct.quantity !== updatedProduct.quantity) {
      await prisma.inventoryHistory.create({
        data: {
          productId: id,
          userId: locals.user.id,
          action: 'QUANTITY_ADJUSTMENT',
          previousQuantity: currentProduct.quantity,
          newQuantity: updatedProduct.quantity,
          quantityChange: updatedProduct.quantity - currentProduct.quantity,
          reason: 'Product quantity updated via API'
        }
      });
    }

    return json({ product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    return json({ error: 'Failed to update product' }, { status: 500 });
  }
};