import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/error.middleware";
import { connectDB } from "./config/database";

import userRoutes from "./modules/users/user.routes";
import productRoutes from "./modules/products/product.routes";
import lotRoutes from "./modules/lots/lot.routes";
import saleRoutes from "./modules/sales/sale.routes";
import scanRoutes from "./modules/scan/scan.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import expressListEndpoints from "express-list-endpoints";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("InventoryApp API is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use(errorHandler); // Global error handler (always after routes are defined)

app.get("/test", (req, res) => {
  res.send("Server working");
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        console.log(expressListEndpoints(app));
    });
};

startServer();