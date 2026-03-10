import { Request, Response } from "express";
import { 
    createProduct,
    getAllProducts,
    getProductById,
    softDeleteProduct
} from "./product.service";

export const createProductController = async (req: Request, res: Response) => {
    try{
        const product = await createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to create product", error });
    }
};

export const getAllProductsController = async (req: Request, res: Response) => {
    try {
        const products = await getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products", error });
    }
};

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
        const product = await getProductById(req.params.id as string);

        if(!product) {
            return res.status(404).json({ message: "Product not found " });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};

export const deleteProductController = async (req: Request, res: Response) => {
    try {
        const product = await softDeleteProduct(req.params.id as string);

        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted", product });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};