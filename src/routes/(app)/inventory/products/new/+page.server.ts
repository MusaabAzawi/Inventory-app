import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { productSchema } from '$lib/utils/validators';
import { z } from 'zod';

export const load: PageServerLoad = async ({ url }) => {
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: 'asc' }
  });

  // Get barcode from URL if passed from scanner
  const barcodeFromUrl = url.searchParams.get('barcode');

  return {
    categories,
    initialBarcode: barcodeFromUrl
  };
};

// ... rest of the actions remain the same
export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

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
      location: formData.get('location')?.toString() || null,
      expiryDate: formData.get('expiryDate')?.toString() || null
    };

    try {
      const validatedData = productSchema.parse(data);

      // Check if SKU already exists
      const existingSku = await prisma.product.findUnique({
        where: { sku: validatedData.sku }
      });

      if (existingSku) {
        return fail(400, {
          ...data,
          error: 'SKU already exists'
        });
      }

      // Check if barcode already exists (if provided)
      if (validatedData.barcode) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode: validatedData.barcode }
        });

        if (existingBarcode) {
          return fail(400, {
            ...data,
            error: 'Barcode already exists'
          });
        }
      }

      // Create the product
      const product = await prisma.product.create({
        data: validatedData
      });

      // Log inventory history
      await prisma.inventoryHistory.create({
        data: {
          productId: product.id,
          userId: locals.user.id,
          action: 'INITIAL_STOCK',
          previousQuantity: 0,
          newQuantity: validatedData.quantity,
          quantityChange: validatedData.quantity,
          reason: 'Initial product creation'
        }
      });

      throw redirect(302, '/inventory?success=product_created&name=' + encodeURIComponent(validatedData.nameEn));
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

      console.error('Product creation error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to create product'
      });
    }
  }
};