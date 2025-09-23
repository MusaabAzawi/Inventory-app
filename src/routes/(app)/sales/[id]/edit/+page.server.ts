// src/routes/(app)/sales/[id]/edit/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  weight: z.number().optional()
});

const saleSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CREDIT', 'CARD']),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required')
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  const saleId = params.id;

  try {
    // Check if sale can be edited (within 24 hours)
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
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

    if (!sale) {
      throw error(404, 'Sale not found');
    }

    // Check if sale can be edited (not older than 24 hours)
    const saleDate = new Date(sale.createdAt);
    const hoursDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw error(403, 'Sales older than 24 hours cannot be edited');
    }

    // Load products and customers for the form
    const [products, customers] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true
        },
        orderBy: { nameEn: 'asc' }
      }),
      prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
      })
    ]);

    return {
      sale,
      products,
      customers
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Error loading sale for edit:', err);
    throw error(500, 'Failed to load sale details');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const saleId = params.id!;

    const formData = await request.formData();
    const data = {
      customerId: formData.get('customerId')?.toString() || '',
      paymentMethod: formData.get('paymentMethod')?.toString() || 'CASH',
      discount: parseFloat(formData.get('discount')?.toString() || '0'),
      tax: parseFloat(formData.get('tax')?.toString() || '0'),
      notes: formData.get('notes')?.toString() || '',
      items: JSON.parse(formData.get('items')?.toString() || '[]')
    };

    try {
      // Validate the data
      const validatedData = saleSchema.parse({
        ...data,
        customerId: data.customerId || undefined,
        notes: data.notes || undefined,
        paymentMethod: data.paymentMethod as 'CASH' | 'CREDIT' | 'CARD'
      });

      // Check sale edit eligibility again
      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { items: true }
      });

      if (!existingSale) {
        return fail(404, { error: 'Sale not found' });
      }

      const saleDate = new Date(existingSale.createdAt);
      const hoursDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return fail(403, { error: 'Sales older than 24 hours cannot be edited' });
      }

      // Process the update in a transaction
      await prisma.$transaction(async (tx) => {
        // Calculate totals
        const subtotal = validatedData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const netAmount = subtotal - validatedData.discount + validatedData.tax;

        // Get current sale items to calculate inventory changes
        const currentItems = existingSale.items;

        // Calculate inventory adjustments
        const inventoryChanges = new Map<string, number>();

        // First, restore inventory for current items (removing them)
        for (const item of currentItems) {
          const key = item.productId;
          const current = inventoryChanges.get(key) || 0;
          inventoryChanges.set(key, current + item.quantity);
        }

        // Then, reduce inventory for new items
        for (const item of validatedData.items) {
          const key = item.productId;
          const current = inventoryChanges.get(key) || 0;
          inventoryChanges.set(key, current - item.quantity);
        }

        // Validate stock availability for all items
        for (const item of validatedData.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          const inventoryChange = inventoryChanges.get(item.productId) || 0;
          const futureQuantity = product.quantity + inventoryChange;

          if (futureQuantity < 0) {
            throw new Error(`Insufficient stock for ${product.nameEn}. Available: ${product.quantity + (currentItems.find(ci => ci.productId === item.productId)?.quantity || 0)}, Requested: ${item.quantity}`);
          }
        }

        // Update product quantities and create inventory history
        for (const [productId, quantityChange] of Array.from(inventoryChanges.entries())) {
          if (quantityChange !== 0) {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (product) {
              const newQuantity = product.quantity + quantityChange;

              await tx.product.update({
                where: { id: productId },
                data: { quantity: newQuantity }
              });

              await tx.inventoryHistory.create({
                data: {
                  productId,
                  userId: locals.user!.id,
                  action: 'SALE_EDIT',
                  previousQuantity: product.quantity,
                  newQuantity,
                  quantityChange,
                  reason: `Sale ${saleId} edited`,
                  referenceId: saleId
                }
              });
            }
          }
        }

        // Delete existing sale items
        await tx.saleItem.deleteMany({
          where: { saleId: saleId }
        });

        // Update sale
        await tx.sale.update({
          where: { id: saleId },
          data: {
            customerId: validatedData.customerId,
            paymentMethod: validatedData.paymentMethod,
            totalAmount: subtotal,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            notes: validatedData.notes
          }
        });

        // Create new sale items
        await tx.saleItem.createMany({
          data: validatedData.items.map(item => ({
            saleId: saleId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            weight: item.weight
          }))
        });
      });

      throw redirect(302, `/sales/${saleId}`);
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

      console.error('Sale update error:', error);
      return fail(500, {
        ...data,
        error: typeof error === 'object' && error && 'message' in error ? error.message : 'Failed to update sale'
      });
    }
  }
};