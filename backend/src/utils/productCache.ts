const productCache = new Map<string, any>();

export const getCachedProduct = (code: string) => {
    return productCache.get(code);
}

export const setCachedProduct = (code: string, product: any) => {
    return productCache.set(code, product);
}