import mongoose from "mongoose";
import Movement from "./movement.model";

export const createMovement = async (
    productId: mongoose.Types.ObjectId,
    type: "purchase" | "sale" | "adjustment",
    quantity: number,
    lotId?: mongoose.Types.ObjectId,
    reference?: string
) => {
    return await Movement.create({
        productId,
        lotId,
        type,
        quantity,
        reference
    });
};