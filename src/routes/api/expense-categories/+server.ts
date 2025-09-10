import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const categories = await prisma.expenseCategory.findMany({
			where: { isActive: true },
			orderBy: [
				{ isSystem: 'desc' }, // System categories first
				{ nameEn: 'asc' }
			]
		});
		
		return json(categories);
	} catch (error) {
		console.error('Error fetching expense categories:', error);
		return json({ error: 'Failed to fetch expense categories' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		// Validate required fields
		if (!data.nameEn || !data.nameAr) {
			return json({ error: 'Name in both English and Arabic is required' }, { status: 400 });
		}

		// Check for uniqueness
		const existingCategory = await prisma.expenseCategory.findFirst({
			where: {
				OR: [
					{ nameEn: data.nameEn },
					{ nameAr: data.nameAr }
				]
			}
		});
		
		if (existingCategory) {
			return json({ error: 'Category with this name already exists' }, { status: 400 });
		}

		const category = await prisma.expenseCategory.create({
			data: {
				nameEn: data.nameEn,
				nameAr: data.nameAr,
				isSystem: false, // User-created categories are not system categories
				isActive: data.isActive ?? true
			}
		});
		
		return json(category, { status: 201 });
	} catch (error) {
		console.error('Error creating expense category:', error);
		return json({ error: 'Failed to create expense category' }, { status: 500 });
	}
};