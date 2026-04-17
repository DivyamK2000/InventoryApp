import { z } from "zod";

// Function to validate data & format of Request input for user creation
export const createUserSchema = z.object({
    name: z.string().trim().min(5).max(120),
    email: z.string().trim().email().min(10).max(200),
    password: z.string().min(6).max(200)
});

// Function to validate data & format of Request input for user login
export const loginUserSchema = z.object({
    email: z.string().trim().email().min(1),
    password: z.string().min(1)
});

// Function to validate data & format of Request input for user profile update
export const updateUserProfileSchema =  z.object({
    name: z.string().trim().min(5).max(120).optional(),
    email: z.string().trim().email().min(10).max(120).optional()
}).strict();

// Function to validate data & format of Request input for user password update
export const updateUserPasswordSchema = z.object({
    currentPassword: z.string().min(6).max(200),
    newPassword: z.string().min(6).max(200),
    confirmNewPassword: z.string().min(6).max(200)
})
.strict()
.refine((data) => {
    if(data.newPassword) {
        return(
            data.confirmNewPassword && data.newPassword === data.confirmNewPassword
        );
    }
    return true;
},{
    message: "Password do not match",
    path: ["confirmNewPassword"],
});

// Export types of value to be expected in the field
export type registerUserDTO = z.infer<typeof createUserSchema>;

// Export types of value to be expected in the field
export type loginUserDTO = z.infer<typeof loginUserSchema>;

// Export types of value to be expected in the field
export type updateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;

// Export types of value to be expected in the field
export type updateUserPasswordDTO = z.infer<typeof updateUserPasswordSchema>;