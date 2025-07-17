import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { barcode } = params;
  
  if (!barcode) {
    return json({ error: 'Barcode is required' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true
      }
    });

    if (product) {
      return json({
        success: true,
        product: {
          id: product.id,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          sku: product.sku,
          barcode: product.barcode,
          quantity: product.quantity,
          minQuantity: product.minQuantity,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          location: product.location,
          category: product.category
        }
      });
    } else {
      return json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};