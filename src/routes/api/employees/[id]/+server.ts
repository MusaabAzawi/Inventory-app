import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const employee = await prisma.employee.findUnique({
			where: { id: params.id }
		});
		
		if (!employee) {
			return json({ error: 'Employee not found' }, { status: 404 });
		}
		
		return json(employee);
	} catch (error) {
		console.error('Error fetching employee:', error);
		return json({ error: 'Failed to fetch employee' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const data = await request.json();
		
		// Validate required fields
		if (!data.nameEn || !data.nameAr) {
			return json({ error: 'Name in both English and Arabic is required' }, { status: 400 });
		}

		// Check for email uniqueness if provided and different from current
		if (data.email) {
			const existingEmployee = await prisma.employee.findFirst({
				where: {
					email: data.email,
					id: { not: params.id }
				}
			});
			
			if (existingEmployee) {
				return json({ error: 'Employee with this email already exists' }, { status: 400 });
			}
		}

		const employee = await prisma.employee.update({
			where: { id: params.id },
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
		
		return json(employee);
	} catch (error) {
		console.error('Error updating employee:', error);
		return json({ error: 'Failed to update employee' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		// Check if employee has associated transactions
		const transactionCount = await prisma.cashTransaction.count({
			where: { employeeId: params.id }
		});
		
		if (transactionCount > 0) {
			return json({ 
				error: 'Cannot delete employee with associated transactions. Set as inactive instead.' 
			}, { status: 400 });
		}

		await prisma.employee.delete({
			where: { id: params.id }
		});
		
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting employee:', error);
		return json({ error: 'Failed to delete employee' }, { status: 500 });
	}
};