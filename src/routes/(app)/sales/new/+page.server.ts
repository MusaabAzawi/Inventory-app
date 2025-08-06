// src/routes/(app)/sales/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive')
});

const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  paymentMethod: z.enum(['CASH', 'CREDIT', 'CARD'], {
    errorMap: () => ({ message: 'Please select a valid payment method' })
  }),
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

    try {
      const formData = await request.formData();
      
      // Parse and validate items
      let itemsData;
      try {
        const itemsString = formData.get('items')?.toString();
        if (!itemsString) {
          return fail(400, { error: 'No items provided' });
        }
        itemsData = JSON.parse(itemsString);
      } catch (parseError) {
        return fail(400, { error: 'Invalid items data format' });
      }

      // Prepare data for validation
      const data = {
        customerId: formData.get('customerId')?.toString() || undefined,
        items: itemsData.map((item: any) => ({
          productId: item.productId || '',
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0
        })),
        discount: Number(formData.get('discount')?.toString() || '0'),
        tax: Number(formData.get('tax')?.toString() || '0'),
        paymentMethod: formData.get('paymentMethod')?.toString() || '',
        notes: formData.get('notes')?.toString() || undefined
      };

      // Validate the data
      const validationResult = saleSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return fail(400, {
          error: 'Validation failed: ' + errors.join(', '),
          formData: data
        });
      }

      const validatedData = validationResult.data;

      // Generate unique invoice number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const invoiceNumber = `INV-${timestamp}-${random}`;

      // Validate products and calculate totals
      let totalAmount = 0;
      const itemsWithTotals = [];

      for (const [index, item] of validatedData.items.entries()) {
        // Verify product exists and has sufficient quantity
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return fail(400, {
            error: `Product not found for item ${index + 1}`,
            formData: data
          });
        }

        if (!product.isActive) {
          return fail(400, {
            error: `Product "${product.nameEn}" is not active`,
            formData: data
          });
        }

        if (product.quantity < item.quantity) {
          return fail(400, {
            error: `Insufficient stock for "${product.nameEn}". Available: ${product.quantity}, Requested: ${item.quantity}`,
            formData: data
          });
        }

        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;

        itemsWithTotals.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          product: product
        });
      }

      const netAmount = totalAmount - validatedData.discount + validatedData.tax;

      if (netAmount < 0) {
        return fail(400, {
          error: 'Net amount cannot be negative. Please check discount amount.',
          formData: data
        });
      }

      // Create sale in transaction - this ensures data consistency
      const sale = await prisma.$transaction(async (tx) => {
        // Create the sale record
        const newSale = await tx.sale.create({
          data: {
            invoiceNumber,
            customerId: validatedData.customerId || null,
            userId: locals.user!.id,
            totalAmount,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            paymentMethod: validatedData.paymentMethod,
            notes: validatedData.notes,
            status: 'COMPLETED'
          }
        });

        // Create sale items and update inventory
        for (const item of itemsWithTotals) {
          // Create sale item
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total
            }
          });

          // Update product quantity
          const updatedProduct = await tx.product.update({
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
              previousQuantity: updatedProduct.quantity + item.quantity,
              newQuantity: updatedProduct.quantity,
              quantityChange: -item.quantity,
              reason: `Sale - Invoice: ${invoiceNumber}`,
              referenceId: newSale.id
            }
          });
        }

        return newSale;
      });

      // Success - redirect to sales list (since we don't have sale detail page yet)
      throw redirect(302, '/sales');
      
    } catch (error) {
      // Handle redirect separately - don't treat it as an error
      if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
        throw error; // Re-throw redirect
      }

      console.error('Sale creation error:', error);
      
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case 'P2002': // Unique constraint violation
            return fail(400, {
              error: 'Invoice number already exists. Please try again.',
            });
          case 'P2025': // Record not found
            return fail(400, {
              error: 'One or more selected products no longer exist.',
            });
          default:
            return fail(500, {
              error: 'Database error occurred while creating the sale.',
            });
        }
      }

      return fail(500, {
        error: 'An unexpected error occurred while creating the sale. Please try again.',
      });
    }
  }
};