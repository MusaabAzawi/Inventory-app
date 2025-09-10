import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string().min(2),
  preferredLanguage: z.enum(['ar', 'en']).default('ar')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const productSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  quantity: z.number().int().min(0),
  minQuantity: z.number().int().min(0),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  categoryId: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null)
});

export const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).min(1),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paymentMethod: z.string(),
  notes: z.string().optional()
});

export const cashTransactionSchema = z.object({
  type: z.enum(['RECEIPT', 'PAYMENT', 'SALARY', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive().default(1),
  accountId: z.string(),
  description: z.string().optional()
});