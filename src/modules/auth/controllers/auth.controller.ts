import type { Request, Response, NextFunction } from "express";
import type { IAuthService } from "../../../interfaces/IAuthService";

/**
 * AuthController — Single Responsibility: handles HTTP request/response only.
 * Depends on IAuthService interface, not concrete class (Dependency Inversion).
 * Contains no business logic — delegates everything to the service layer.
 */
class AuthController {
    constructor(private readonly authService: IAuthService) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, email, password } = req.body;
            const result = await this.authService.register(name, email, password);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;