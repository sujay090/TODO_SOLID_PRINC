import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import AuthService from "../services/auth.service";
import UserRepository from "../../../config/repositories/UserRepository";

// Dependency injection: Repository → Service → Controller
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;