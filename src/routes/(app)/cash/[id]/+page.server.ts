// src/routes/(app)/cash/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const transactionId = params.id;

  try {
    const transaction = await prisma.cashTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!transaction) {
      throw error(404, 'Transaction not found');
    }

    return { transaction };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading cash transaction:', err);
    throw error(500, 'Failed to load transaction details');
  }
};