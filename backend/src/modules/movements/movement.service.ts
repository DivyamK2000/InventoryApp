import mongoose from "mongoose";
import Movement from "./movement.model";
import { CreateMovementDTO, createMovementSchema } from "./movement.validation";


export const createMovement = async (
    data: CreateMovementDTO,
    session?: mongoose.ClientSession

) => {

    const validated = createMovementSchema.parse(data);

    const movement = await Movement.create([validated], { session });

    return movement[0]
};