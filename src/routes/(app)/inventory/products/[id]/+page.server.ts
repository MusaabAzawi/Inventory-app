import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { productSchema } from '$lib/utils/validators';
import { z } from 'zod';

export const load: PageServerLoad = async ({ params }) => {
  const productId = params.id;

  try {
    const [product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      }),
      prisma.category.findMany({
        orderBy: { nameEn: 'asc' }
      })
    ]);

    if (!product) {
      throw error(404, 'Product not found');
    }

    return {
      product,
      categories
    };
  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    throw error(500, 'Failed to load product');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const productId = params.id;
    const formData = await request.formData();
    
    const data = {
      nameEn: formData.get('nameEn')?.toString(),
      nameAr: formData.get('nameAr')?.toString(),
      sku: formData.get('sku')?.toString(),
      barcode: formData.get('barcode')?.toString() || null,
      quantity: parseInt(formData.get('quantity')?.toString() || '0'),
      minQuantity: parseInt(formData.get('minQuantity')?.toString() || '5'),
      costPrice: parseFloat(formData.get('costPrice')?.toString() || '0'),
      sellingPrice: parseFloat(formData.get('sellingPrice')?.toString() || '0'),
      categoryId: formData.get('categoryId')?.toString() || null,
      location: formData.get('location')?.toString() || null
    };

    try {
      const validatedData = productSchema.parse(data);

      // Get current product
      const currentProduct = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!currentProduct) {
        return fail(404, { error: 'Product not found' });
      }

      // Check if SKU already exists (excluding current product)
      if (validatedData.sku !== currentProduct.sku) {
        const existingSku = await prisma.product.findFirst({
          where: { 
            sku: validatedData.sku,
            id: { not: productId }
          }
        });

        if (existingSku) {
          return fail(400, {
            ...data,
            error: 'SKU already exists'
          });
        }
      }

      // Check if barcode already exists (excluding current product)
      if (validatedData.barcode && validatedData.barcode !== currentProduct.barcode) {
        const existingBarcode = await prisma.product.findFirst({
          where: { 
            barcode: validatedData.barcode,
            id: { not: productId }
          }
        });

        if (existingBarcode) {
          return fail(400, {
            ...data,
            error: 'Barcode already exists'
          });
        }
      }

      // Update the product
      await prisma.product.update({
        where: { id: productId },
        data: validatedData
      });

      // Log inventory history if quantity changed
      if (currentProduct.quantity !== validatedData.quantity) {
        await prisma.inventoryHistory.create({
          data: {
            productId,
            userId: locals.user.id,
            action: 'QUANTITY_ADJUSTMENT',
            previousQuantity: currentProduct.quantity,
            newQuantity: validatedData.quantity,
            reason: 'Product quantity updated'
          }
        });
      }

      throw redirect(302, '/inventory');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          ...data,
          error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
        });
      }
      
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Product update error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to update product'
      });
    }
  }
};