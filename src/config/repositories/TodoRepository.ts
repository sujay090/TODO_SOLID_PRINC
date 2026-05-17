import BaseRepository from "./BaseRepository";
import type { ITodoRepository, PaginatedResult, TodoFilters } from "../../interfaces/ITodoRepository";

export interface Todo {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface TodoCreate {
    user_id: number;
    title: string;
    description: string | null;
}

interface TodoUpdate {
    title?: string;
    description?: string | null;
    completed?: boolean;
}

/**
 * TodoRepository — Single Responsibility: only handles data access for todos.
 * Implements ITodoRepository interface (Dependency Inversion).
 * Extends BaseRepository for shared query logic (Open/Closed — add methods without modifying base).
 */
class TodoRepository extends BaseRepository implements ITodoRepository {

    async create(data: TodoCreate): Promise<Todo | null> {
        const { rows } = await this.query<Todo>(
            "INSERT INTO todos(user_id, title, description) VALUES($1, $2, $3) RETURNING *",
            [data.user_id, data.title, data.description || null]
        );
        return rows[0] || null;
    }

    async findAllByUser(user_id: number): Promise<Todo[]> {
        const { rows } = await this.query<Todo>(
            "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );
        return rows;
    }

    async findAllByUserPaginated(
        user_id: number,
        page: number,
        limit: number,
        filters?: TodoFilters
    ): Promise<PaginatedResult<Todo>> {
        const offset = (page - 1) * limit;

        // Build dynamic WHERE clause
        const conditions: string[] = ["user_id = $1"];
        const params: any[] = [user_id];
        let paramIndex = 2;

        if (filters?.completed !== undefined) {
            conditions.push(`completed = $${paramIndex}`);
            params.push(filters.completed);
            paramIndex++;
        }

        if (filters?.title) {
            conditions.push(`title ILIKE $${paramIndex}`);
            params.push(`%${filters.title}%`);
            paramIndex++;
        }

        const whereClause = conditions.join(" AND ");

        // Sorting
        const validSortColumns = ["created_at", "updated_at", "title"];
        const sortBy = filters?.sortBy && validSortColumns.includes(filters.sortBy)
            ? filters.sortBy
            : "created_at";
        const order = filters?.order === "asc" ? "ASC" : "DESC";

        // Count total matching records
        const countResult = await this.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM todos WHERE ${whereClause}`,
            params
        );
        const total = Number(countResult.rows[0]?.count || 0);

        // Fetch paginated results
        const dataParams = [...params, limit, offset];
        const { rows } = await this.query<Todo>(
            `SELECT * FROM todos WHERE ${whereClause} ORDER BY ${sortBy} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            dataParams
        );

        return { data: rows, page, limit, total };
    }

    async findById(id: number): Promise<Todo | null> {
        const { rows } = await this.query<Todo>(
            "SELECT * FROM todos WHERE id = $1",
            [id]
        );
        return rows[0] || null;
    }

    async update(id: number, data: TodoUpdate): Promise<Todo | null> {
        const { rows } = await this.query<Todo>(
            "UPDATE todos SET title=COALESCE($1,title), description=COALESCE($2,description), completed=COALESCE($3,completed), updated_at=NOW() WHERE id = $4 RETURNING *",
            [data.title, data.description, data.completed, id]
        );
        return rows[0] || null;
    }

    async delete(id: number, user_id: number): Promise<boolean> {
        const result = await this.query(
            "DELETE FROM todos WHERE id = $1 AND user_id = $2",
            [id, user_id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async toggleComplete(id: number, user_id: number): Promise<Todo | null> {
        const { rows } = await this.query<Todo>(
            "UPDATE todos SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, user_id]
        );
        return rows[0] || null;
    }

    async countByUser(user_id: number): Promise<number> {
        const { rows } = await this.query<{ count: string }>(
            "SELECT COUNT(*) as count FROM todos WHERE user_id = $1",
            [user_id]
        );
        return Number(rows[0]?.count || 0);
    }
}

export default TodoRepository;
