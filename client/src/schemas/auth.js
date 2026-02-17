import { z } from 'zod';

const validCompanySizes = ['Small น้อยกว่า 50 คน', 'Medium 51-200 คน', 'Large มากกว่า 200 คน'];

export const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().nonempty({ message: 'Password is required' }),
});

export const signUpStep1Schema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password' }),
    companyRef: z.string().optional(),
    showCompanyRef: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.showCompanyRef || (data.companyRef && data.companyRef.length > 0), {
    message: 'Company reference is required when selected',
    path: ['companyRef'],
  });

export const signUpStep2Schema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  companySize: z.object({
    id: z.number(),
    name: z.enum(validCompanySizes, {
      error_message: 'Please select a valid company size',
    }),
  }),
  mainAddress: z.string().min(1, { message: 'Main address is required' }),
  telAddress: z.string().min(1, { message: 'Tel address is required' }),
  legalEntityNumber: z.string().min(1, { message: 'Legal entity number is required' }),
});
