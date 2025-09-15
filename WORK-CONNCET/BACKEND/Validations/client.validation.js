const { z } = require('zod');

const createClientSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['Lead','In Progress','Converted']).optional()
});

module.exports = { createClientSchema };
