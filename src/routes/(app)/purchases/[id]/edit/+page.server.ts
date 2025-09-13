import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  weight: z.number().optional()
});

const purchaseSchema = z.object({
  supplierId: z.string().optional(),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required')
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  const purchaseId = params.id;
  
  try {
    // Load purchase with items and relationships
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        user: true
      }
    });

    if (!purchase) {
      redirect(302, '/purchases');
    }

    // Load products with categories
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true
      },
      orderBy: { nameEn: 'asc' }
    });

    // Load suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' }
    });

    return {
      purchase,
      products,
      suppliers
    };
  } catch (error) {
    console.error('Error loading purchase for edit:', error);
    redirect(302, '/purchases');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const purchaseId = params.id;
    
    const formData = await request.formData();
    const data = {
      supplierId: formData.get('supplierId')?.toString() || '',
      discount: parseFloat(formData.get('discount')?.toString() || '0'),
      tax: parseFloat(formData.get('tax')?.toString() || '0'),
      purchaseDate: formData.get('purchaseDate')?.toString() || '',
      notes: formData.get('notes')?.toString() || '',
      items: JSON.parse(formData.get('items')?.toString() || '[]')
    };

    try {
      const validatedData = purchaseSchema.parse({
        ...data,
        supplierId: data.supplierId || undefined,
        notes: data.notes || undefined
      });

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Calculate totals
        const totalAmount = validatedData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const netAmount = totalAmount - validatedData.discount + validatedData.tax;

        // Delete existing items
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: purchaseId }
        });

        // Update purchase
        const updatedPurchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            supplierId: validatedData.supplierId,
            totalAmount,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            notes: validatedData.notes,
            purchaseDate: new Date(validatedData.purchaseDate)
          }
        });

        // Create new items
        await tx.purchaseItem.createMany({
          data: validatedData.items.map(item => ({
            purchaseId: purchaseId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            weight: item.weight
          }))
        });

        return updatedPurchase;
      });

      throw redirect(302, `/purchases/${purchaseId}`);
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

      console.error('Purchase update error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to update purchase'
      });
    }
  }
};