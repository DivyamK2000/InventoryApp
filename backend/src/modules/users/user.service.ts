import User from "./user.model";
import bcrypt from "bcrypt";
import { registerUserDTO, loginUserDTO } from "./user.validation";
import { BadRequestError, NotFoundError } from "../../utils/appError";
import mongoose from "mongoose";

export const createUser = async(data: registerUserDTO) => {
    const existingUser = await findUserByEmail(data.email.toLowerCase());

    if(existingUser){
        throw new BadRequestError("User already exists", {
            email: "This email is already registered"
        });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
        name: data.name,
        email: data.email,
        passwordHash
    });
    
    return user.save();
};

export const loginUser = async(data: loginUserDTO) => {
    if(!data.email || !data.password) {
        throw new BadRequestError("Validation Failed", {
            email: !data.email ? "Email is required" : undefined,
            password: !data.password ? "Password is required" : undefined
        });
    }

    const user = await findUserByEmail(data.email.toLowerCase());

    if(!user) {
        throw new BadRequestError("Invalid credentials!");
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if(!isValid) {
        throw new BadRequestError("Invalid credentials!");
    }

    return user
}

export const findUserByEmail = async(email: string) => {
    const user = await User.findOne({ email, isActive: true }).select("+passwordHash");

    return user;
};

export const findUserById = async(userId: mongoose.Types.ObjectId) => {
    const user = await User.findOne({ _id: userId, isActive: true });

    if(!user) {
        throw new NotFoundError("User not found");
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
        { returnDocument: "after" }
    );

    if(!user) {
        throw new NotFoundError("User not found");
    }

    return user;
}