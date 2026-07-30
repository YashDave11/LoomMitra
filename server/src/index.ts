import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import weaverRoutes from "./routes/weaver";
import businessRoutes from "./routes/business";
import customerRoutes from "./routes/customer";
import productRoutes from "./routes/products";
import discoverRoutes from "./routes/discover";
import bulkOrderRoutes from "./routes/bulkOrders";
import customerOrderRoutes from "./routes/customerOrders";
import auctionRoutes from "./routes/auctions";

import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

// Clean FRONTEND_URL to ensure no trailing slash causes CORS string-mismatch
const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const cleanFrontendUrl = rawFrontendUrl.endsWith("/") ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

app.use(cors({ origin: cleanFrontendUrl, credentials: true }));
app.use(express.json());
app.use("/CatalogOutput", express.static(path.join(__dirname, "../../public/CatalogOutput")));


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/weaver", weaverRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/orders/bulk", bulkOrderRoutes);
app.use("/api/orders/customer", customerOrderRoutes);
app.use("/api/auctions", auctionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
