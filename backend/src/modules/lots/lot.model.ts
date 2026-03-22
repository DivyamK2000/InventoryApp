import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface ILot extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    lotCode: string;
    purchasePrice: number;
    quantityInitial: number;
    quantityRemaining: number;
    purchaseDate: Date;
    mfd?: Date;
    bestBefore?: {
        value: number;
        unit: "day" | "week" | "month" | "year";
    };
    expiryDate?: Date;
    createdAt: Date;
    
}

const LotSchema = new Schema<ILot>(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        lotCode: {
            type: String,
            required: true
        },

        purchasePrice: {
            type: Number,
            required: true
        },

        quantityInitial:{
            type: Number,
            required: true
        },

        quantityRemaining: {
            type: Number,
            required: true
        },

        purchaseDate: {
            type: Date,
            default: Date.now
        },

        mfd: {
            type: Date
        },

        bestBefore: {
            value: { type: Number },
            unit: {
                type: String,
                enum: ["day", "week", "month", "year"]
            }
        },

        expiryDate: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

LotSchema.pre<ILot>("save" as any, async function() {
    if(!this.mfd || !this.bestBefore?.value || !this.bestBefore?.unit) return;

    const expiry = new Date(this.mfd);



    const { value, unit } = this.bestBefore;

    switch(unit) {
        case "day":
            expiry.setDate(expiry.getDate() + value);
            break;
        case "week":
            expiry.setDate(expiry.getDate() + value*7);
            break;
        case "month":
            expiry.setMonth(expiry.getMonth() + value);
            break;
        case "year":
            expiry.setFullYear(expiry.getFullYear() + value);
            break;
    }

    this.expiryDate = expiry;
});

LotSchema.index(
    { userId: 1, lotCode: 1},
    {unique: true}
);

LotSchema.index({ userId: 1, expiryDate: 1 });

export default mongoose.model<ILot>("Lot", LotSchema);