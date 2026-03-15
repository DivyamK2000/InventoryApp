import Product, { IProduct } from "./product.model";

const generatorPrefix = (name: string): string => {
    const cleaned = name.replace(/[^a-zA-Z]/g, "");

    const words = cleaned.split(/\s+/);

    if(words.length === 1) {
        return words[0].substring(0, 3).toUpperCase();
    }

    if(words.length === 2) {
        return words[1].substring(0, 3).toUpperCase();
    }

    return words
    .slice(0, 3)
    .map(word => word[0])
    .join("")
    .toUpperCase();
};

const generateProductCode = async (prefix: string): Promise<string> => {
    const lastProduct = await Product.findOne({ prefix }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if(lastProduct) {
        const lastNumber = parseInt(lastProduct.productCode.split("-")[1]);
        nextNumber = lastNumber + 1; 
    }

    const formattedNumber = String(nextNumber).padStart(3, "0");

    return `${prefix}-${formattedNumber}`;
}

export const createProduct = async (data: Partial<IProduct>) => {
    const prefix = data.prefix || generatorPrefix(data.name!);

    const productCode = await generateProductCode(prefix);

    const product = new Product({
        ...data,
        prefix,
        productCode
    });

    return await product.save();
};

export const getAllProducts = async () => {
    return await Product.find({ isActive: true });
};

export const getProductById = async (id: String) => {
    return await Product.findById(id);
};

export const softDeleteProduct = async (id: String) => {
    return await Product.findByIdAndUpdate(
        id,
        {
            isActive: false,
            deletedAt: new Date()
        },
        { new: true }
    );
};