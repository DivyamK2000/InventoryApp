import mongoose, { Document, Schema } from "mongoose";

export interface IMovement extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    lotId: mongoose.Types.ObjectId;
    lotCode: string;
    type: "purchase" | "sale" | "adjustment";
    quantity: number;
    reference: string;
    note?: string;
    createdAt: Date;
}

const MovementSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        lotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lot",
            required: true
        },

        lotCode: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["purchase", "sale", "adjustment"],
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        reference: {
            type: String,
            required: true
        },

        note: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

MovementSchema.index({ userId: 1, productId: 1, createdAt: -1 });
MovementSchema.index({ userId: 1, lotCode: 1 });

export default mongoose.model<IMovement>("Movement", MovementSchema);