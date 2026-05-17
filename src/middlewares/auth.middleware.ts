import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/AppError";

interface JwtPayload {
    id: number;
    iat: number;
    exp: number;
}

/**
 * Auth middleware — Single Responsibility: only handles JWT verification.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches userId to the request object.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new UnauthorizedError("Token not provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRATE!) as JwtPayload;
        req.userId = decoded.id;
        next();
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
}
