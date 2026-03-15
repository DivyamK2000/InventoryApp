import Product from "../products/product.model";
import Lot from "../lots/lot.model";
import Sale from "../sales/sale.model";
import { DemandRevenue, DemandUnits, ExpiryAlerts, InventorySummary, LowStockProduct, ProductAnalytics } from "./inventory.types";

function getStartDate(period?: string) {
  const now = new Date();

  if (period === "1 week") {
    now.setDate(now.getDate() - 7);
  }

  if (period === "1 month") {
    now.setMonth(now.getMonth() - 1);
  }

  if (period === "6 month") {
    now.setMonth(now.getMonth() - 6);
  }

  if (period === "1 year") {
    now.setFullYear(now.getFullYear() - 1);
  }

  return now;
}

export async function getInventorySummary(period?: string): Promise<InventorySummary> {
  const startDate = getStartDate(period);

  const inventoryData = await Lot.aggregate([
    { $match: { quantityRemaining: { $gt: 0 } } },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $group: {
        _id: null,

        totalInventoryValue: {
          $sum: { $multiply: ["$purchasePrice", "$quantityRemaining"] }
        },

        totalPotentialProfit: {
          $sum: {
            $multiply: [
              { $subtract: ["$product.sellingPrice", "$purchasePrice"] },
              "$quantityRemaining"
            ]
          }
        },

        totalStockUnits: { $sum: "$quantityRemaining" }
      }
    }
  ]);

  const salesMatch = period ? { createdAt: { $gte: startDate } } : {};

  const salesData = await Sale.aggregate([
    { $match: salesMatch },

    {
      $group: {
        _id: null,
        totalSalesRevenue: {
          $sum: { $multiply: ["$quantity", "$sellingPrice"] }
        }
      }
    }
  ]);

  const totalProducts = await Product.countDocuments();

  return {
    totalInventoryValue: inventoryData[0]?.totalInventoryValue || 0,
    totalPotentialProfit: inventoryData[0]?.totalPotentialProfit || 0,
    totalStockUnits: inventoryData[0]?.totalStockUnits || 0,
    totalSalesRevenue: salesData[0]?.totalSalesRevenue || 0,
    totalProducts
  };
}

export async function getProductAnalytics(): Promise<ProductAnalytics[]> {
  return Lot.aggregate([
    { $match: { quantityRemaining: { $gt: 0 } } },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $group: {
        _id: "$productId",

        productName: { $first: "$product.name" },

        totalStock: { $sum: "$quantityRemaining" },

        inventoryValue: {
          $sum: { $multiply: ["$purchasePrice", "$quantityRemaining"] }
        },

        potentialProfit: {
          $sum: {
            $multiply: [
              { $subtract: ["$product.sellingPrice", "$purchasePrice"] },
              "$quantityRemaining"
            ]
          }
        },

        latestSellingPrice: { $first: "$product.sellingPrice" }
      }
    },

    { $sort: { inventoryValue: -1 } }
  ]);
}

export async function getTopDemandProducts(metric?: string): Promise<(DemandUnits | DemandRevenue)[]> {
  const groupStage =
    metric === "revenue"
      ? {
          revenue: {
            $sum: { $multiply: ["$quantity", "$sellingPrice"] }
          }
        }
      : {
          unitSold: { $sum: "$quantity" }
        };

  return Sale.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $group: {
        _id: "$productId",
        productName: { $first: "$product.name" },
        ...groupStage
      }
    },

    {
      $sort: metric === "revenue" ? { revenue: -1 } : { unitSold: -1 }
    },

    { $limit: 10 }
  ]);
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  return Lot.aggregate([
    {
      $group: {
        _id: "$productId",
        remainingStock: { $sum: "$quantityRemaining" }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $match: {
        $expr: {
          $lte: ["$remainingStock", "$product.lowStockThreshold"]
        }
      }
    },

    {
      $project: {
        _id: 0,
        productName: "$product.name",
        remainingStock: 1,
        threshold: "$product.lowStockThreshold"
      }
    }
  ]);
}

export async function getExpiryAlerts(): Promise<ExpiryAlerts> {
  const today = new Date();

  const soon = new Date();
  soon.setDate(today.getDate() + 15);

  const expiringSoon = await Lot.aggregate([
    {
      $match: {
        expiryDate: { $exists: true, $ne: null, $gte: today, $lte: soon },
        quantityRemaining: { $gt: 0 }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $project: {
        productName: "$product.name",
        quantity: "$quantityRemaining",
        expiryDate: 1,
        daysLeft: {
          $dateDiff: {
            startDate: today,
            endDate: "$expiryDate",
            unit: "day"
          }
        }
      }
    },

    { $sort: { daysLeft: 1 } }
  ]);

  const expired = await Lot.aggregate([
    {
      $match: {
        expiryDate: { $exists: true, $ne: null, $lt: today },
        quantityRemaining: { $gt: 0 }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $project: {
        productName: "$product.name",
        quantity: "$quantityRemaining",
        expiryDate: 1
      }
    }
  ]);

  return {
    expiringSoon,
    expired
  };
}

export async function getInventoryDashboard() {
  const today = new Date();

  const soon = new Date();
  soon.setDate(today.getDate() + 15);

  const result = await Lot.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalInventoryValue: {
                $sum: { $multiply: ["$purchasePrice", "$quantityRemaining"] }
              },

              totalPotentialProfit: {
                $sum: {
                  $multiply: [
                    { $subtract: ["$product.sellingPrice", "$purchasePrice"] },
                    "$quantityRemaining"
                  ]
                }
              },

              totalStockUnits: { $sum: "$quantityRemaining" }
            }
          }
        ],

        products: [
          {
            $group: {
              _id: "$productId",

              productName: { $first: "$product.name" },

              totalStock: { $sum: "$quantityRemaining" },

              inventoryValue: {
                $sum: { $multiply: ["$purchasePrice", "$quantityRemaining"] }
              },

              potentialProfit: {
                $sum: {
                  $multiply: [
                    { $subtract: ["$product.sellingPrice", "$purchasePrice"] },
                    "$quantityRemaining"
                  ]
                }
              },

              latestSellingPrice: { $first: "$product.sellingPrice" }
            }
          },

          { $sort: { inventoryValue: -1 } }
        ],

        lowStock: [
          {
            $group: {
              _id: "$productId",
              remainingStock: { $sum: "$quantityRemaining" },
              product: { $first: "$product" }
            }
          },

          {
            $match: {
              $expr: {
                $lte: ["$remainingStock", "$product.lowStockThreshold"]
              }
            }
          },

          {
            $project: {
              _id: 0,
              productName: "$product.name",
              remainingStock: 1,
              threshold: "$product.lowStockThreshold"
            }
          }
        ],

        expiry: [
          {
            $match: {
              expiryDate: { $exists: true, $ne: null },
              quantityRemaining: { $gt: 0 }
            }
          },

          {
            $project: {
              productName: "$product.name",
              quantity: "$quantityRemaining",
              expiryDate: "$expiryDate",
              daysLeft: {
                $dateDiff: {
                  startDate: today,
                  endDate: "$expiryDate",
                  unit: "day"
                }
              }
            }
          }
        ]
      }
    }
  ]);

  const dashboard = result[0];

  const expiringSoon = dashboard.expiry.filter(
    (lot: any) => lot.expiryDate >= today && lot.expiryDate <= soon
  );

  const expired = dashboard.expiry.filter(
    (lot: any) => lot.expiryDate < today
  );

  return {
    summary: dashboard.summary[0] || {},
    products: dashboard.products,
    lowStock: dashboard.lowStock,
    expiry: {
      expiringSoon,
      expired
    }
  };
}