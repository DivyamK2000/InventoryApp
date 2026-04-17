import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    isActive?: boolean;
    deletedAt?: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        deletedAt: {
            type: Date
        }
    },

    { timestamps: true }
);

UserSchema.index({ email: 1, isActive: 1 });

export default mongoose.model<IUser>("User", UserSchema);