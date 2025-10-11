// src/routes/(app)/purchases/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { setFlash } from '$lib/server/flash';
import { z } from 'zod';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  weight: z.number().optional()
});

const purchaseSchema = z.object({
  supplierId: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive('Exchange rate must be positive').default(1),
  purchaseDate: z.string().optional(),
  notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const [products, suppliers] = await Promise.all([
      // Get all products for selection
      prisma.product.findMany({
        where: { isActive: true },
        include: { 
          category: true,
          // Get last purchase price for each product
          purchaseItems: {
            orderBy: { purchase: { purchaseDate: 'desc' } },
            take: 1,
            include: {
              purchase: {
                select: { 
                  purchaseDate: true,
                  supplier: {
                    select: {
                      nameEn: true,
                      nameAr: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { nameEn: 'asc' }
      }),
      // Get active suppliers
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
      })
    ]);

    // Transform products to include last purchase info
    const productsWithLastPurchase = products.map(product => ({
      ...product,
      lastPurchase: product.purchaseItems.length > 0 ? {
        price: product.purchaseItems[0].price,
        date: product.purchaseItems[0].purchase.purchaseDate,
        supplier: product.purchaseItems[0].purchase.supplier
      } : null,
      purchaseItems: undefined // Remove the raw data
    }));

    return {
      products: productsWithLastPurchase,
      suppliers
    };
  } catch (error) {
    console.error('Error loading purchase form data:', error);
    return {
      products: [],
      suppliers: []
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();

      console.log('Received form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // Parse and validate items
      let itemsData;
      try {
        const itemsString = formData.get('items')?.toString();
        if (!itemsString) {
          console.error('No items string in form data');
          return fail(400, { error: 'No items provided' });
        }
        console.log('Items string:', itemsString);
        itemsData = JSON.parse(itemsString);
        console.log('Parsed items data:', itemsData);
      } catch (parseError) {
        console.error('Failed to parse items:', parseError);
        return fail(400, { error: 'Invalid items data format' });
      }

      // Prepare data for validation
      const data = {
        supplierId: formData.get('supplierId')?.toString() || undefined,
        items: itemsData.map((item: any) => ({
          productId: item.productId || '',
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          weight: Number(item.weight) || 0
        })),
        discount: Number(formData.get('discount')?.toString() || '0'),
        tax: Number(formData.get('tax')?.toString() || '0'),
        currency: formData.get('currency')?.toString() || 'USD',
        exchangeRate: Number(formData.get('exchangeRate')?.toString() || '1'),
        purchaseDate: formData.get('purchaseDate')?.toString() || undefined,
        notes: formData.get('notes')?.toString() || undefined
      };

      // Validate the data
      const validationResult = purchaseSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return fail(400, {
          error: 'Validation failed: ' + errors.join(', '),
          formData: data
        });
      }

      const validatedData = validationResult.data;

      // Generate unique invoice number for purchase
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const invoiceNumber = `PUR-${timestamp}-${random}`;

      // Validate products and calculate totals
      let totalAmount = 0;
      const itemsWithTotals = [];

      for (const [index, item] of validatedData.items.entries()) {
        // Verify product exists
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

        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;

        itemsWithTotals.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          discount: 0, // Item-level discount if needed
          weight: item.weight || 0,
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

      // Create purchase in transaction - this ensures data consistency
      const purchase = await prisma.$transaction(async (tx) => {
        // Create the purchase record
        const newPurchase = await tx.purchase.create({
          data: {
            invoiceNumber,
            supplierId: validatedData.supplierId || null,
            userId: locals.user!.id,
            totalAmount,
            discount: validatedData.discount,
            tax: validatedData.tax,
            netAmount,
            currency: validatedData.currency,
            exchangeRate: validatedData.exchangeRate,
            status: 'COMPLETED',
            notes: validatedData.notes,
            purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : new Date()
          }
        });

        // Create purchase items and update inventory
        for (const item of itemsWithTotals) {
          // Create purchase item
          await tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              discount: item.discount,
              weight: item.weight
            }
          });

          // Update product quantity (INCREASE for purchases)
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity },
              // Update cost price to the latest purchase price
              costPrice: item.price
            }
          });

          // Log inventory history
          await tx.inventoryHistory.create({
            data: {
              productId: item.productId,
              userId: locals.user!.id,
              action: 'PURCHASE',
              previousQuantity: updatedProduct.quantity - item.quantity,
              newQuantity: updatedProduct.quantity,
              quantityChange: item.quantity,
              reason: `Purchase - Invoice: ${invoiceNumber}`,
              referenceId: newPurchase.id
            }
          });
        }

        return newPurchase;
      });

      // Set flash message for success
      setFlash(cookies, {
        type: 'success',
        title: 'Purchase Created',
        message: `Purchase order ${invoiceNumber} has been created successfully.`
      });

      // Success - redirect to purchases list
      throw redirect(303, '/purchases');
      
    } catch (error) {
      // Handle redirect separately - don't treat it as an error
      if (error && typeof error === 'object' && 'status' in error && (error.status === 302 || error.status === 303)) {
        throw error; // Re-throw redirect
      }

      console.error('Purchase creation error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });

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
              error: 'Database error occurred while creating the purchase.',
            });
        }
      }

      return fail(500, {
        error: 'An unexpected error occurred while creating the purchase. Please try again.',
      });
    }
  }
};