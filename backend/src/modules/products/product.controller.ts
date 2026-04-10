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
import { SendResponse } from "../../utils/SendResponse";


export const createProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const body = validateRequest(createProductSchema, req.body);

    const product = await createProduct(
        userId,
        body
    );

    return SendResponse(
        req,
        res,
        201,
        "Product created",
        product
    );
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

    return SendResponse(
        req,
        res,
        200,
        "Product updated",
        product
    );
});

export const getAllProductsController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const products = await getAllProducts(userId);

    return SendResponse(
        req,
        res,
        200,
        "Products fetched",
        products
    );
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

    return SendResponse(
        req,
        res,
        200,
        "Product fetched",
        product
    );
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

    return SendResponse(
        req,
        res,
        200,
        "Product deleted",
        product
    );
});