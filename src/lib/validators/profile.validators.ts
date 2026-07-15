import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or fewer"),
  company: z
    .string()
    .max(100, "Company must be 100 characters or fewer")
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or fewer")
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable()
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be 128 characters or fewer"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
