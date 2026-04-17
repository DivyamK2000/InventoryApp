import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware";
import { connectDB } from "./config/database";

import userRoutes from "./modules/users/user.routes";
import productRoutes from "./modules/products/product.routes";
import lotRoutes from "./modules/lots/lot.routes";
import saleRoutes from "./modules/sales/sale.routes";
import expressListEndpoints from "express-list-endpoints";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { httpLogger } from "./middleware/logger.middleware";
import { logger } from "./utils/logger";


const app = express();
const PORT = process.env.PORT;

app.use(requestIdMiddleware);
app.use(httpLogger);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    req.log.info("Root endpoint hit");
    res.send("MeraInventory API is running");
});

app.get("/health", (req, res) => {
  if(process.env.NODE_ENV !== "production") {
    req.log.info("Health check endpoint hit");
  }
  res.status(200).json({ status: "ok" });
});

app.get("/test", (req, res) => {
  res.send("Server working");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/sales", saleRoutes);

app.use(errorHandler); // Global error handler (always after routes are defined)

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);

        if(process.env.NODE_ENV !== "production") {
          logger.info(expressListEndpoints(app));
        }
    });
  } catch(err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", () => {
  logger.info("Shutting down server...");
  process.exit(0);
});