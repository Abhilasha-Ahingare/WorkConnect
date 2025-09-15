const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password min 6 chars")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password min 6 chars")
});

module.exports = { registerSchema, loginSchema };
