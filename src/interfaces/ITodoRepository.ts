import type { Todo, TodoCreate } from "../config/repositories/TodoRepository";

export interface PaginatedResult<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

export interface TodoFilters {
    completed?: boolean;
    title?: string;
    sortBy?: "created_at" | "updated_at" | "title";
    order?: "asc" | "desc";
}

export interface ITodoRepository {
    create(data: TodoCreate): Promise<Todo | null>;
    findById(id: number): Promise<Todo | null>;
    findAllByUser(user_id: number): Promise<Todo[]>;
    findAllByUserPaginated(
        user_id: number,
        page: number,
        limit: number,
        filters?: TodoFilters
    ): Promise<PaginatedResult<Todo>>;
    update(id: number, data: Partial<Pick<Todo, "title" | "description" | "completed">>): Promise<Todo | null>;
    delete(id: number, user_id: number): Promise<boolean>;
    toggleComplete(id: number, user_id: number): Promise<Todo | null>;
    countByUser(user_id: number): Promise<number>;
}
