// src/routes/(app)/sales/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paymentMethod: z.string().min(1),
  notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const [products, customers] = await Promise.all([
      prisma.product.findMany({
        where: { 
          isActive: true,
          quantity: { gt: 0 }
        },
        include: { category: true },
        orderBy: { nameEn: 'asc' }
      }),
      prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
      })
    ]);

    return {
      products,
      customers
    };
  } catch (error) {
    console.error('Error loading sale form data:', error);
    return {
      products: [],
      customers: []
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    
    try {
      // Parse items from form data
      const itemsData = JSON.parse(formData.get('items')?.toString() || '[]');
      
      const data = {
        customerId: formData.get('customerId')?.toString() || undefined,
        items: itemsData,
        discount: parseFloat(formData.get('discount')?.toString() || '0'),
        tax: parseFloat(formData.get('tax')?.toString() || '0'),
        paymentMethod: formData.get('paymentMethod')?.toString() || '',
        notes: formData.get('notes')?.toString() || undefined
      };

      const validatedData = saleSchema.parse(data);

      // Generate invoice number
      const lastSale = await prisma.sale.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { invoiceNumber: true }
      });

      const lastNumber = lastSale ? parseInt(lastSale.invoiceNumber.replace(/\D/g, '')) : 0;
      const invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;

      // Calculate totals
      let totalAmount = 0;
      const itemsWithTotals = [];

      for (const item of validatedData.items) {
        // Verify product exists and has sufficient quantity
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return fail(400, {
            ...data,
            error: `Product not found: ${item.productId}`
          });
        }

        if (product.quantity < item.quantity) {
          return fail(400, {
            ...data,
            error: `Insufficient stock for ${product.nameEn}. Available: ${product.quantity}, Requested: ${item.quantity}`
          });
        }

        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;

        itemsWithTotals.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal
        });
      }

      const netAmount = totalAmount - validatedData.discount + validatedData.tax;

      // Create sale in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create sale
        const sale = await tx.sale.create({
          data: {
            invoiceNumber,
            customerId: validatedData.customerId || null,
            userId: locals.user!.id,
            totalAmount,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            paymentMethod: validatedData.paymentMethod,
            notes: validatedData.notes
          }
        });

        // Create sale items and update inventory
        for (const item of itemsWithTotals) {
          // Create sale item
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total
            }
          });

          // Update product quantity
          const product = await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { decrement: item.quantity }
            }
          });

          // Log inventory history
          await tx.inventoryHistory.create({
            data: {
              productId: item.productId,
              userId: locals.user!.id,
              action: 'SALE',
              previousQuantity: product.quantity + item.quantity,
              newQuantity: product.quantity,
              quantityChange: -item.quantity,
              reason: `Sale invoice: ${invoiceNumber}`,
              referenceId: sale.id
            }
          });
        }

        return sale;
      });

      throw redirect(302, `/sales/${result.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          error: 'Validation failed: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Sale creation error:', error);
      return fail(500, {
        error: 'Failed to create sale'
      });
    }
  }
};