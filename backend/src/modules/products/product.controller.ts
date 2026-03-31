import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { 
    createProduct,
    getAllProducts,
    getProductById,
    softDeleteProduct,
    updateProduct
} from "./product.service";
import { createProductSchema, productIdParamSchema, updateProductSchema } from "./product.validation";
import { validateRequest } from "../../utils/validateRequests";


export const createProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const body = validateRequest(createProductSchema, req.body);

    const product = await createProduct(
        userId,
        body
    );

    res.status(201).json({
        success: true,
        message: "Product created",
        data: product
    });
});

export const updateProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const { id: productId } = validateRequest(
        productIdParamSchema,
        req.params
    );

    const body = validateRequest(updateProductSchema, req.body);

    const product = await updateProduct(
        userId,
        productId,
        body
    )

    res.status(200).json({
        success: true,
        message: "Product updated",
        data: product
    });
})

export const getAllProductsController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const products = await getAllProducts(userId);

    res.status(200).json({
        success: true,
        message: "Products fetched",
        data: products
    });
});

export const getProductByIdController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    
    const { id: productId } = validateRequest(
        productIdParamSchema,
        req.params
    );

    const product = await getProductById(
        userId,
        productId
    );

    res.status(200).json({
        success: true,
        message: "Product fetched",
        data: product
    });
});

export const deleteProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    
    const { id: productId } = validateRequest(
        productIdParamSchema,
        req.params
    );

    const product = await softDeleteProduct(
        userId,
        productId
    );

    res.status(200).json({ 
        success: true,
        message: "Product deleted",
        data: product 
    });
});