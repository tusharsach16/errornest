import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or fewer"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
