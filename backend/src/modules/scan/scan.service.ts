import mongoose from "mongoose";
import Lot from "../lots/lot.model";
import Product from "../products/product.model";
import { getCachedProduct, setCachedProduct } from "../../utils/productCache";

export const scanCode = async (code: string) => {
    if(code.startsWith("LOT:")) {
        return scanLot(code);
    }

    if(code.startsWith("PROD:")){
        return scanProduct(code);
    }

    return scanBarCode(code);
};

const scanLot = async(code: string) => {
    const lotId = code.replace("LOT:", "").trim();
    
    if(!mongoose.Types.ObjectId.isValid(lotId)) {
        throw new Error("Invalid Lot ID");
    }
        
    const result = await Lot.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(lotId) }
        },
        {
            $lookup: {
                from: "lots",
                let: { productId: "$productId", purchaseDate: "$purchaseDate" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$productId", "$$productId"] },
                                    { $lt: ["$purchaseDate", "$$purchaseDate"] },
                                    { $gt: ["$quantityRemaining", 0] }
                                ]
                            }
                        }
                    }
                ],
                as: "olderLots"
            }
        }
    ]);
    
    if(!result.length) {
        throw new Error("Lot not found");
    }
    
    const lot = result[0];
    
    return {
        type: "LOT",
        lotId: lot._id,
        productId: lot.productId,
        purchasePrice: lot.purchasePrice,
        quantityRemaining: lot.quantityRemaining,
        warning: lot.olderLots.length > 0 ? "Older lot exists for this product" : null 
    };  
};

const scanProduct = async(code: string) => {
    const productId = code.replace("PROD:", "").trim();
    
    if(!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid Product ID");
    }
    
    const product = await Product.findById(productId);
    
    if(!product) {
        throw new Error("Product not found");
    }
    
    return {
        type: "PRODUCT",
        product
    };
};

const scanBarCode = async(code: string) => {
    let product = getCachedProduct(code);
    
    if(!product) {
        product = await Product.findOne({
            productCode: code
        });
    
        if(product) {
            setCachedProduct(code, product);
        }
    }
    
    if(product) {
        return {
            type: "BARCODE",
            product
        };
    }
}