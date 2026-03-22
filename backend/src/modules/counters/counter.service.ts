import Counter from "./counter.model";
import mongoose from "mongoose";

export const getNextSequence = async (
    prefix: string,
    session: mongoose.ClientSession
) => {
    const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: {seq: 1} },
        { returnDocument : "after", upsert: true, session }
    );

    return counter.seq;
}