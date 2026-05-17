import type { Request, Response, NextFunction } from "express";
import type { ITodoService } from "../../../interfaces/ITodoService";
import type { TodoFilters } from "../../../interfaces/ITodoRepository";
import { UnauthorizedError } from "../../../errors/AppError";

/**
 * TodoController — Single Responsibility: handles HTTP request/response only.
 * Depends on ITodoService interface (Dependency Inversion).
 * Extracts userId from req (set by auth middleware) and delegates to service.
 */
class TodoController {
    constructor(private readonly todoService: ITodoService) {}

    private getUserId(req: Request): number {
        if (!req.userId) {
            throw new UnauthorizedError("Unauthorized");
        }
        return req.userId;
    }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserId(req);
            const { title, description } = req.body;
            const todo = await this.todoService.create(userId, title, description);
            res.status(201).json({
                id: todo.id,
                title: todo.title,
                description: todo.description,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserId(req);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Build filters from query params
            const filters: TodoFilters = {};
            if (req.query.completed !== undefined) {
                filters.completed = req.query.completed === "true";
            }
            if (req.query.title) {
                filters.title = req.query.title as string;
            }
            if (req.query.sortBy) {
                filters.sortBy = req.query.sortBy as TodoFilters["sortBy"];
            }
            if (req.query.order) {
                filters.order = req.query.order as TodoFilters["order"];
            }

            const result = await this.todoService.getTodos(userId, page, limit, filters);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserId(req);
            const todoId = parseInt(req.params.id);
            const { title, description } = req.body;
            const todo = await this.todoService.update(userId, todoId, title, description);
            res.status(200).json({
                id: todo.id,
                title: todo.title,
                description: todo.description,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = this.getUserId(req);
            const todoId = parseInt(req.params.id);
            await this.todoService.delete(userId, todoId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

export default TodoController;
