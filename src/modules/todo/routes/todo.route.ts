import { Router } from "express";
import TodoController from "../controllers/todo.controller";
import TodoService from "../services/todo.service";
import TodoRepository from "../../../config/repositories/TodoRepository";
import { authMiddleware } from "../../../middlewares/auth.middleware";

// Dependency injection: Repository → Service → Controller
const todoRepo = new TodoRepository();
const todoService = new TodoService(todoRepo);
const todoController = new TodoController(todoService);

const router = Router();

// All todo routes require authentication
router.use(authMiddleware);

router.post("/", todoController.create);
router.get("/", todoController.getAll);
router.put("/:id", todoController.update);
router.delete("/:id", todoController.delete);

export default router;
