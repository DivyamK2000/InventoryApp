import User, { IUser } from "./user.model";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createUserSchema, loginUserSchema } from "./user.validation";

type registerDTO = z.infer<typeof createUserSchema>;

type loginDTO = z.infer<typeof loginUserSchema>;

export const createUser = async(data: registerDTO) => {
    const existingUser = await findUserByEmail(data.email);

    if(existingUser){
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
        name: data.name,
        email: data.email,
        passwordHash
    });
    
    return user.save();
};

export const loginUser = async(data: loginDTO) => {
    if(!data.email || !data.password) {
        throw new Error("Password & E-mail can not be empty!");
    }

    const user = await findUserByEmail(data.email);

    if(!user) {
        throw new Error("Invalid credentials!");
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if(!isValid) {
        throw new Error("Invalid credentials!");
    }

    return user
}

export const findUserByEmail = async(email: string) => {
    return User.findOne({ email });
};

export const findUserById = async(id: string) => {
    return User.findById(id);
};