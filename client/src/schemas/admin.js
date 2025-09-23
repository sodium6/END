// client/src/schemas/admin.js
import { z } from 'zod';
export const adminLoginSchema = z.object({
  username: z.string().min(3, 'ชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
});

export const userSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']), // Adjust roles as needed
  status: z.enum(['active', 'suspended']), // Adjust statuses as needed
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

