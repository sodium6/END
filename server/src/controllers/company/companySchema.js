const z = require('zod');

const companySchema = z.object({
  name: z.string().min(6, 'Name must more than 6 words'),
  username: z.string().min(6, 'Username must more than 6 words'),
  password: z
    .string()
    .min(8, 'Username must more than 8 words')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
});

module.exports = companySchema;
