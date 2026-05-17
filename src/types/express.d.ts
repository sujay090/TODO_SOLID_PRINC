// Extend Express Request to include userId from JWT auth middleware
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export {};
