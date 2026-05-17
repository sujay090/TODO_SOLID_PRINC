import express from "express";
import cors from "cors";
import authRoute from "./modules/auth/routes/auth.route";
import todoRoute from "./modules/todo/routes/todo.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Global middlewares
app.use(express.json());
app.use(cors());

// Health check
app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Todo API is running" });
});

// Routes — mounted at root paths per assignment spec
app.use("/", authRoute);        // POST /register, POST /login
app.use("/todos", todoRoute);   // POST/GET /todos, PUT/DELETE /todos/:id

// Global error handler (must be after all routes)
app.use(errorHandler);

export default app;
