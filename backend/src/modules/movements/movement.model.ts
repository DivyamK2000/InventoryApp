import mongoose, { Document, Schema } from "mongoose";

export interface IMovement extends Document {
    productId: mongoose.Types.ObjectId;
    lotId?: mongoose.Types.ObjectId;
    type: "purchase" | "sale" | "adjustment";
    quantity: number;
    reference?: string;
    createdAt: Date;
}

const MovementSchema: Schema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        lotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lot"
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
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IMovement>("Movement", MovementSchema);