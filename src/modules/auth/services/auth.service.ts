import type { IUserRepository } from "../../../interfaces/IUserRepository";
import type { IAuthService, AuthTokenResponse } from "../../../interfaces/IAuthService";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../../errors/AppError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * AuthService — Single Responsibility: handles authentication logic only.
 * Depends on IUserRepository interface, not concrete class (Dependency Inversion).
 * Implements IAuthService interface (Interface Segregation).
 */
class AuthService implements IAuthService {
    constructor(private readonly userRepo: IUserRepository) {}

    private generateToken(userId: number): string {
        return jwt.sign({ id: userId }, process.env.JWT_SECRATE!, { expiresIn: "1h" });
    }

    async register(name: string, email: string, password: string): Promise<AuthTokenResponse> {
        if (!name || !email || !password) {
            throw new BadRequestError("Name, email, and password are required");
        }

        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userRepo.create({ name, email, password: hashedPassword });

        if (!user) {
            throw new Error("Failed to create user");
        }

        const token = this.generateToken(user.id);
        return { token };
    }

    async login(email: string, password: string): Promise<AuthTokenResponse> {
        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = this.generateToken(user.id);
        return { token };
    }
}

export default AuthService;
