import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * Global error handler — Single Responsibility: only formats error responses.
 * Catches all errors and responds with the appropriate HTTP status code.
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    // Unexpected errors
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ message: "Internal Server Error" });
}
