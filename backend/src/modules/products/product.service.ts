import Product, { IProduct } from "./product.model";

export const createProduct = async (data: Partial<IProduct>) => {
    const product = new Product(data);
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