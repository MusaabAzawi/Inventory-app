// src/routes/(app)/sales/[id]/return/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const saleId = params.id;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    nameEn: true,
                    nameAr: true
                  }
                }
              }
            },
            returns: {
              where: {
                status: 'COMPLETED'
              }
            }
          },
          orderBy: { id: 'asc' }
        },
        returns: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!sale) {
      throw error(404, 'Sale not found');
    }

    // Check if sale can be returned (not older than 30 days)
    const saleDate = new Date(sale.createdAt);
    const daysDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30) {
      throw error(403, 'Sales older than 30 days cannot be returned');
    }

    return { sale };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading sale for return:', err);
    throw error(500, 'Failed to load sale details');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      throw error(401, 'Unauthorized');
    }

    const saleId = params.id!;
    const formData = await request.formData();

    try {
      const reason = formData.get('reason') as string;
      const returnItemsJson = formData.get('returnItems') as string;

      if (!reason || !returnItemsJson) {
        return fail(400, {
          error: 'Reason and return items are required'
        });
      }

      const returnItems = JSON.parse(returnItemsJson);

      if (!Array.isArray(returnItems) || returnItems.length === 0) {
        return fail(400, {
          error: 'At least one item must be selected for return'
        });
      }

      // Validate return items
      for (const item of returnItems) {
        if (!item.saleItemId || !item.quantity || item.quantity <= 0) {
          return fail(400, {
            error: 'Invalid return item data'
          });
        }
      }

      // Calculate total return amount
      let totalReturnAmount = 0;

      // Process return in transaction
      await prisma.$transaction(async (tx) => {
        // Verify sale exists and get original items
        const sale = await tx.sale.findUnique({
          where: { id: saleId },
          include: {
            items: true
          }
        });

        if (!sale) {
          throw new Error('Sale not found');
        }

        // Check return eligibility again
        const saleDate = new Date(sale.createdAt);
        const daysDiff = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff > 30) {
          throw new Error('Sales older than 30 days cannot be returned');
        }

        // Process each return item
        for (const returnItem of returnItems) {
          const originalItem = sale.items.find(item => item.id === returnItem.saleItemId);

          if (!originalItem) {
            throw new Error(`Sale item ${returnItem.saleItemId} not found`);
          }

          // Calculate how much has already been returned for this sale item
          const alreadyReturnedQuantity = originalItem.returns?.reduce((sum, ret) => sum + ret.quantity, 0) || 0;
          const availableForReturn = originalItem.quantity - alreadyReturnedQuantity;

          // Check if return quantity exceeds available quantity
          if (returnItem.quantity > availableForReturn) {
            throw new Error(`Cannot return ${returnItem.quantity} items. Only ${availableForReturn} items available for return (original: ${originalItem.quantity}, already returned: ${alreadyReturnedQuantity}).`);
          }

          // Calculate return amount for this item
          const returnAmount = (originalItem.price * returnItem.quantity);
          totalReturnAmount += returnAmount;

          // Create return record using the existing Return table
          await tx.return.create({
            data: {
              saleId,
              saleItemId: returnItem.saleItemId,
              reason,
              amount: returnAmount,
              quantity: returnItem.quantity,
              status: 'COMPLETED'
            }
          });

          // Get current product info for inventory history
          const product = await tx.product.findUnique({
            where: { id: originalItem.productId }
          });

          if (!product) {
            throw new Error(`Product ${originalItem.productId} not found`);
          }

          const newQuantity = product.quantity + returnItem.quantity;

          // Update product inventory (return items to stock)
          await tx.product.update({
            where: { id: originalItem.productId },
            data: {
              quantity: newQuantity
            }
          });

          // Create inventory history record
          await tx.inventoryHistory.create({
            data: {
              productId: originalItem.productId,
              userId: locals.user!.id,
              action: 'RETURN',
              previousQuantity: product.quantity,
              newQuantity,
              quantityChange: returnItem.quantity,
              reason: `Sale return: ${reason}`,
              referenceId: saleId
            }
          });
        }

        // Update sale with return information (reduce net amount)
        await tx.sale.update({
          where: { id: saleId },
          data: {
            netAmount: {
              decrement: totalReturnAmount
            },
            updatedAt: new Date()
          }
        });
      });

      throw redirect(303, `/sales/${saleId}`);
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        throw err;
      }

      console.error('Error processing return:', err);
      return fail(500, {
        error: typeof err === 'object' && err && 'message' in err ? err.message : 'Failed to process return'
      });
    }
  }
};