import User from "./user.model";
import bcrypt from "bcrypt";
import { registerUserDTO, loginUserDTO } from "./user.validation";
import { BadRequestError, NotFoundError } from "../../utils/AppError";
import mongoose from "mongoose";

export const createUser = async(data: registerUserDTO) => {
    const email = data.email.toLowerCase();
    const existingUser = await findUserByEmail(email);

    if(existingUser){
        if(!existingUser.isActive) {
            throw new BadRequestError(
                "Account recently deleted. Please restore your account to continue",
                "AUTH_ACCOUNT_SOFT_DELETED",
                 {
                    email: "This email is associated with a recently deleted account. Please restore your account to continue"
                }
            )
        }
        throw new BadRequestError(
            "User already exists",
            "AUTH_USER_ALREADY_EXISTS", 
            {
                email: "This email is already registered",
            }
        );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
        name: data.name,
        email,
        passwordHash
    });
    
    return user.save();
};

export const loginUser = async(data: loginUserDTO) => {
    const email = data.email.toLowerCase();

    const user = await findUserByEmailWithPassword(email);

    if(!user) {
        throw new BadRequestError(
            "Invalid credentials!",
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if(!isValid) {
        throw new BadRequestError(
            "Invalid credentials!",
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    return user
}

export const findUserByEmail = async(email: string) => {
    const user = await User.findOne({ email });

    return user;
};

export const findUserByEmailWithPassword = async(email: string) => {
    const user = await User.findOne({ email, isActive: true }).select("+passwordHash");

    return user;
};

export const findUserById = async(userId: mongoose.Types.ObjectId) => {
    const user = await User.findOne({ _id: userId, isActive: true });

    if(!user) {
        throw new NotFoundError(
            "User not found",
            "USER_NOT_FOUND"
        );
    }

    return user;
};

export const softDeleteUser = async(userId: mongoose.Types.ObjectId) => {
    const user = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        {
            isActive: false,
            deletedAt: new Date()
        },
        { new: true }
    );

    if(!user) {
        throw new NotFoundError(
            "User not found",
            "USER_NOT_FOUND"
        );
    }

    return user;
}