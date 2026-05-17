import type { ITodoRepository, PaginatedResult, TodoFilters } from "../../../interfaces/ITodoRepository";
import type { ITodoService } from "../../../interfaces/ITodoService";
import type { Todo } from "../../../config/repositories/TodoRepository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../errors/AppError";

/**
 * TodoService — Single Responsibility: handles todo business logic only.
 * Depends on ITodoRepository interface, not concrete class (Dependency Inversion).
 * Implements ITodoService interface (Interface Segregation).
 * Enforces ownership checks — users can only modify their own todos.
 */
class TodoService implements ITodoService {
    constructor(private readonly todoRepo: ITodoRepository) {}

    async create(userId: number, title: string, description: string | null): Promise<Todo> {
        if (!title) {
            throw new BadRequestError("Title is required");
        }

        const todo = await this.todoRepo.create({
            user_id: userId,
            title,
            description: description || null,
        });

        if (!todo) {
            throw new Error("Failed to create todo");
        }

        return todo;
    }

    async getTodos(
        userId: number,
        page: number,
        limit: number,
        filters?: TodoFilters
    ): Promise<PaginatedResult<Todo>> {
        // Sanitize pagination params
        const safePage = Math.max(1, page || 1);
        const safeLimit = Math.min(100, Math.max(1, limit || 10));

        return this.todoRepo.findAllByUserPaginated(userId, safePage, safeLimit, filters);
    }

    async update(userId: number, todoId: number, title: string, description: string): Promise<Todo> {
        if (!title && !description) {
            throw new BadRequestError("At least title or description is required");
        }

        const todo = await this.todoRepo.findById(todoId);
        if (!todo) {
            throw new NotFoundError("Todo not found");
        }

        // Ownership check — only the creator can update
        if (todo.user_id !== userId) {
            throw new ForbiddenError("Forbidden");
        }

        const updatedTodo = await this.todoRepo.update(todoId, { title, description });
        if (!updatedTodo) {
            throw new Error("Failed to update todo");
        }

        return updatedTodo;
    }

    async delete(userId: number, todoId: number): Promise<void> {
        const todo = await this.todoRepo.findById(todoId);
        if (!todo) {
            throw new NotFoundError("Todo not found");
        }

        // Ownership check
        if (todo.user_id !== userId) {
            throw new ForbiddenError("Forbidden");
        }

        const deleted = await this.todoRepo.delete(todoId, userId);
        if (!deleted) {
            throw new Error("Failed to delete todo");
        }
    }
}

export default TodoService;