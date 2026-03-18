import Counter from "./counter.model";

export const getNextSequence = async (prefix: string) => {
    const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: {seq: 1} },
        { new : true, upsert: true }
    );

    return counter.seq;
}