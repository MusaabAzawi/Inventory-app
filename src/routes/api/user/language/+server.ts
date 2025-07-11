import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { language } = await request.json();
  
  if (!['ar', 'en'].includes(language)) {
    return json({ error: 'Invalid language' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: locals.user.id },
    data: { preferredLanguage: language }
  });

  return json({ success: true });
};