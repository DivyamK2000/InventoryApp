export interface InventorySummary {
    totalInventoryValue: number;
    totalPotentialProfit: number;
    totalSalesRevenue: number;
    totalProducts: number;
    totalStockUnits: number;
}

export interface ProductAnalytics {
    productName: string;
    totalStock: number;
    inventoryValue: number;
    potentialProfit: number;
}

export interface DemandUnits {
    productName: string;
    unitsSold: number;
}

export interface DemandRevenue {
    productName: string;
    revenue: number;
}

export interface LowStockProduct {
    productName: string;
    remainingStock: number;
    threshold: number;
}

export interface ExpiringProduct {
    productName: string;
    quantity: number;
    daysLeft: number;
}

export interface ExpiredProduct {
    productName: string;
    qunatity: number;
}

export interface ExpiryAlerts {
    expiringSoon: ExpiringProduct[];
    expired: ExpiredProduct[];
}