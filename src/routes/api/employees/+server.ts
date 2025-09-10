import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const employees = await prisma.employee.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});
		
		return json(employees);
	} catch (error) {
		console.error('Error fetching employees:', error);
		return json({ error: 'Failed to fetch employees' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		// Validate required fields
		if (!data.nameEn || !data.nameAr) {
			return json({ error: 'Name in both English and Arabic is required' }, { status: 400 });
		}

		// Check for email uniqueness if provided
		if (data.email) {
			const existingEmployee = await prisma.employee.findUnique({
				where: { email: data.email }
			});
			
			if (existingEmployee) {
				return json({ error: 'Employee with this email already exists' }, { status: 400 });
			}
		}

		const employee = await prisma.employee.create({
			data: {
				nameEn: data.nameEn,
				nameAr: data.nameAr,
				email: data.email || null,
				phone: data.phone || null,
				position: data.position || null,
				salary: data.salary || null,
				isActive: data.isActive ?? true
			}
		});
		
		return json(employee, { status: 201 });
	} catch (error) {
		console.error('Error creating employee:', error);
		return json({ error: 'Failed to create employee' }, { status: 500 });
	}
};