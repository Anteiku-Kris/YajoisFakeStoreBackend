import express from "express";
import productRoutes from "./routes/products.routes";
import categoryRoutes from "./routes/categories.routes";
import reviewRoutes from "./routes/reviews.routes";
import adminRoutes from "./routes/admin.routes";

import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);

//admin routes
app.use("/api/admin", adminRoutes);

//middleware para manejar errores, SIEMPRE va al final

app.use(errorHandler);

export default app;
