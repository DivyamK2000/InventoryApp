import Counter from "./counter.model";
import mongoose from "mongoose";

export const getNextSequence = async(
    prefix: string,
    session: mongoose.ClientSession
) => {
    const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: {seq: 1} },
        { returnDocument : "after", upsert: true, session }
    );

    return counter.seq;
};

export const getNextSequenceRange = async(
    prefix: string,
    count: number,
    session: mongoose.ClientSession
) => {
    const counter = await Counter.findByIdAndUpdate(
        prefix,
        {inc: { seq: count }},
        { returnDocument: "after", upsert: true, session }
    );

    const end = counter.seq;
    const start = end - count + 1;

    return { start, end };
};