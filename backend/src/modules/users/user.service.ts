import User from "./user.model";
import bcrypt from "bcrypt";
import { registerUserDTO, loginUserDTO, updateUserProfileDTO, updateUserPasswordDTO } from "./user.validation";
import { generateToken } from "../../config/jwt";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../utils/AppError";
import mongoose from "mongoose";

// Create User
export const createUser = async(data: registerUserDTO) => {
    const email = data.email.toLowerCase();
    const existingUser = await findUserByEmail(email);

    // Check for existing user
    if(existingUser){
        // If existing user but soft deleted
        if(!existingUser.isActive) {
            throw new BadRequestError(
                "Account recently deleted. Please restore your account to continue",
                "AUTH_ACCOUNT_SOFT_DELETED",
                 {
                    email: "This email is associated with a recently deleted account. Please restore your account to continue"
                }
            )
        }
        // If existing user is active
        throw new BadRequestError(
            "User already exists",
            "AUTH_USER_ALREADY_EXISTS", 
            {
                email: "This email is already registered",
            }
        );
    }

    // Hash the provided password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Save new user info to DB
    const user = new User({
        name: data.name,
        email,
        passwordHash
    });
    
    // Return the saved user
    return user.save();
};

// Login User
export const loginUser = async(data: loginUserDTO) => {
    // Normalize the email provided
    const email = data.email.toLowerCase();

    // Call function to find user by email with password
    const user = await findUserByEmailWithPassword(email);

    // If user does not exist
    if(!user) {
        throw new UnauthorizedError(
            "Invalid credentials!",
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    // Verify the password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    // If provided password is not valid
    if(!isValid) {
        throw new UnauthorizedError(
            "Invalid credentials!",
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    // Generate token using user Id
    const token = generateToken(user._id.toString());

    // Return user (safe data) & token to response
    return { 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        }, 
        token 
    };
};

// Update User Profile
export const updateUserProfile = async(
    userId: mongoose.Types.ObjectId,
    data: updateUserProfileDTO
) => {
    // Calling function find user by Id
    const user = await findUserById(userId);

    // If user is account is deleted
    if(user.isActive === false) {
        throw new UnauthorizedError(
            "User account is deactive",
            "AUTH_USER_DEACTIVE"
        );
    }

    // Store updated fields
    const updateFields: any = {};

    // If input has name field stores in `updatedFields`
    if(data.name) updateFields.name = data.name;

    // If input has email field stores in `updatedFields`
    if(data.email && data.email !== user.email) {
        const updatedEmail = await updateProfile(data.email);
        updateFields.email = updatedEmail;
    }

    // Finds the user through Id and updates fields with new value
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        { $set: updateFields },
        { returnDocument: "after" }
    ).lean();

    // Return user (safe data) to response
    return {
        user: {
            id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
        }
    }

};

// Update User Password
export const updateUserPassword = async(
    userId: mongoose.Types.ObjectId,
    data: updateUserPasswordDTO
) => {
    // Calling function to find user through Id
    const user = await findUserById(userId);

    // If user account is soft-deleted inactive
    if(user.isActive === false) {
        throw new UnauthorizedError(
            "User account is deactive",
            "AUTH_USER_DEACTIVE"
        );
    }

    // Verifys the password
    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);

    // If provided value for password isn't valid
    if(!isMatch) {
        throw new UnauthorizedError(
            "Invalid credentials",
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    // Declare a variable to store new password
    let passwordHash;

    // Checks if the provided value has both new and confirmed password
    if (data.newPassword && data.confirmNewPassword) {
        const updatedPasswordHash = await updatePassword(data.newPassword, data.confirmNewPassword);
        passwordHash = updatedPasswordHash;
    }

    // Finds the user through Id and updates it with new password (hashed)
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        { $set: { ...(passwordHash && { passwordHash })} },
        { returnDocument: "after" }
    ).lean();

    // returns user (safe data) to response
    return {
        id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email
    }
};

// Helper function for update profile fields of user
const updateProfile = async(email: string) => {
    // Calling function to find user through email
    const existing = await findUserByEmail(email);

    // CHecks if the email already exists
    if(existing){
        throw new BadRequestError(
            "This email already exist",
            "AUTH_EMAIL_ALREADY_EXISTS"
        );
    }

    // Returns a normalized email
    return email.toLowerCase();
};

// Helper function to update password field
const updatePassword = async(newPassword: string, confirmNewPassword: string) => {
    // Checks if new password provided
    if(newPassword) {
        // Handles the edge case if the confirm password is not provided
        if(!confirmNewPassword) {
            throw new BadRequestError(
                "Please confirm new password",
                "AUTH_CONFIRM_NEW_PASSWORD"
            );
        }

        // Handles edge case if new password & confirm password does not match
        if(newPassword !== confirmNewPassword) {
            throw new BadRequestError(
                "New password & confirm password does not match. Try again",
                "AUTH_PASSWORD_DOES_NOT_MATCH"
            );
        }
        
        // Returns hashed new password
        return await bcrypt.hash(newPassword, 10);
    }
}

// Soft Deletes User 
export const softDeleteUser = async(userId: mongoose.Types.ObjectId) => {
    // Finds the user through Id and sets isActive to false
    const user = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        {
            isActive: false,
            deletedAt: new Date()
        },
        { returnDocument: "after" }
    );

    // Handles the edge case if user does not exists
    if(!user) {
        throw new NotFoundError(
            "User not found",
            "USER_NOT_FOUND"
        );
    }

    // Returns deleted user info to response
    return user;
};

// Helper function to find user through email
const findUserByEmail = async(email: string) => {
    // Checks the DB for the email and fetches it
    const user = await User.findOne({ email });

    // Returns user const varaible to caller function
    return user;
};

// Helper function to find user through email (including password) and checks if isActive is set to true
const findUserByEmailWithPassword = async(email: string) => {
    // Checks the DB for email(with password), & have isActive as true and fetches it
    const user = await User.findOne({ email, isActive: true }).select("+passwordHash");

    // Returns user const varaible to caller function
    return user;
};

// Helper function to find user through Id
export const findUserById = async(userId: mongoose.Types.ObjectId) => {
    // Checks DB for userId & fetches it
    const user = await User.findOne({ _id: userId });

    // Handle the edge case if user does not exist
    if(!user) {
        throw new NotFoundError(
            "User not found",
            "AUTH_USER_NOT_FOUND"
        );
    }

    // Returns user const varaible to caller function
    return user;
};