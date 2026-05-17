import type { Todo } from "../config/repositories/TodoRepository";
import type { PaginatedResult, TodoFilters } from "./ITodoRepository";

export interface ITodoService {
    create(userId: number, title: string, description: string | null): Promise<Todo>;
    getTodos(userId: number, page: number, limit: number, filters?: TodoFilters): Promise<PaginatedResult<Todo>>;
    update(userId: number, todoId: number, title: string, description: string): Promise<Todo>;
    delete(userId: number, todoId: number): Promise<void>;
}
