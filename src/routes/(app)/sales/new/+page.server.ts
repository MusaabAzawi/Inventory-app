// src/routes/(app)/sales/new/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { saleSchema } from '$lib/utils/validators';
import { z } from 'zod';

export const load: PageServerLoad = async () => {
  try {
    const [products, customers] = await Promise.all([
      prisma.product.findMany({
        where: {
          quantity: {
            gt: 0
          }
        },
        include: {
          category: true
        },
        orderBy: { nameEn: 'asc' }
      }),
      prisma.customer.findMany({
        orderBy: { nameEn: 'asc' }
      })
    ]);

    // Get next invoice number
    const lastSale = await prisma.sale.findFirst({
      orderBy: { invoiceNumber: 'desc' }
    });

    let nextInvoiceNumber = 'INV-000001';
    if (lastSale) {
      const lastNumber = parseInt(lastSale.invoiceNumber.split('-')[1]);
      nextInvoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
    }

    return {
      products,
      customers,
      nextInvoiceNumber
    };
  } catch (error) {
    console.error('Load new sale error:', error);
    return {
      products: [],
      customers: [],
      nextInvoiceNumber: 'INV-000001'
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
      // Parse form data
      const data = {
        customerId: formData.get('customerId')?.toString() || undefined,
        items: JSON.parse(formData.get('items')?.toString() || '[]'),
        discount: parseFloat(formData.get('discount')?.toString() || '0'),
        tax: parseFloat(formData.get('tax')?.toString() || '0'),
        paymentMethod: formData.get('paymentMethod')?.toString() || 'CASH',
        notes: formData.get('notes')?.toString() || undefined
      };

      // Validate data
      const validatedData = saleSchema.parse(data);

      // Calculate totals
      const subtotal = validatedData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const netAmount = subtotal - validatedData.discount + validatedData.tax;

      // Get next invoice number (double-check)
      const lastSale = await prisma.sale.findFirst({
        orderBy: { invoiceNumber: 'desc' }
      });

      let invoiceNumber = 'INV-000001';
      if (lastSale) {
        const lastNumber = parseInt(lastSale.invoiceNumber.split('-')[1]);
        invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
      }

      // Start transaction
      const sale = await prisma.$transaction(async (tx) => {
        // Create sale
        const newSale = await tx.sale.create({
          data: {
            invoiceNumber,
            customerId: validatedData.customerId,
            userId: locals.user!.id,
            subtotal,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            paymentMethod: validatedData.paymentMethod,
            paymentStatus: 'PAID',
            notes: validatedData.notes
          }
        });

        // Create sale items and update product quantities
        for (const item of validatedData.items) {
          // Check product availability
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.nameEn}. Available: ${product.quantity}`);
          }

          // Create sale item
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            }
          });

          // Update product quantity
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });

          // Log inventory history
          await tx.inventoryHistory.create({
            data: {
              productId: item.productId,
              userId: locals.user!.id,
              action: 'SALE',
              previousQuantity: product.quantity,
              newQuantity: product.quantity - item.quantity,
              quantityChange: -item.quantity,
              reason: `Sale ${invoiceNumber}`
            }
          });
        }

        return newSale;
      });

      throw redirect(302, `/sales/${sale.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          error: 'Invalid sale data: ' + error.errors.map(e => e.message).join(', ')
        });
      }
      
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Create sale error:', error);
      return fail(500, {
        error: error instanceof Error ? error.message : 'Failed to create sale'
      });
    }
  }
};