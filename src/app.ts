import express from "express";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./config/swagger";

import productRoutes from "./routes/products.routes";
import categoryRoutes from "./routes/categories.routes";
import reviewRoutes from "./routes/reviews.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

import { errorHandler } from "./middlewares/errorHandler";



const app = express();
const swaggerSpec = swaggerJSDoc(swaggerOptions)

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);

//admin routes
app.use("/api/admin", adminRoutes);

//user routes
app.use("/api", userRoutes);

//middleware para manejar errores, SIEMPRE va al final

app.use(errorHandler);

export default app;
