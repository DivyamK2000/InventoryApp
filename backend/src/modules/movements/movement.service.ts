import mongoose from "mongoose";
import Movement from "./movement.model";
import { CreateMovementDTO, createMovementSchema } from "./movement.validation";


export const createMovement = async(
    data: CreateMovementDTO,
    session?: mongoose.ClientSession
) => {

    const validated = createMovementSchema.parse(data);

    const movement = await Movement.create([validated], { session });

    return movement[0]
};

export const createMovementBulk = async(
    data: CreateMovementDTO[],
    session?: mongoose.ClientSession
) => {
    const validated = data.map(item => createMovementSchema.parse(item));

    const movements = await Movement.insertMany(validated, { session });

    return movements;
};