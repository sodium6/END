import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminAccountSchema = z.object({
  accountType: z.literal('admin'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'superadmin']),
  status: z.enum(['active', 'suspended']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const generalAccountSchema = z.object({
  accountType: z.literal('general'),
  title: z.string().min(1, 'Title is required'),
  first_name_th: z.string().min(1, 'ชื่อ (TH) ต้องกรอก'),
  last_name_th: z.string().min(1, 'นามสกุล (TH) ต้องกรอก'),
  first_name_en: z.string().min(1, 'ชื่อ (EN) ต้องกรอก'),
  last_name_en: z.string().min(1, 'นามสกุล (EN) ต้องกรอก'),
  phone: z.string().min(9, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  education: z.string().min(1, 'Education is required'),
  st_id: z.string().optional(),
  st_id_canonical: z.string().min(1, 'Student ID (canonical) is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
