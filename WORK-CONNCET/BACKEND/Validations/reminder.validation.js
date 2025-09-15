const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  assignedClients: z.array(z.string()).min(1, "Assign at least one client"),
  reminderDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" })
});

module.exports = { createTaskSchema };
