import BaseRepository from "./BaseRepository";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreate {
    name: string;
    email: string;
    password: string;
}


class UserRepository extends BaseRepository {
    async create(data: UserCreate): Promise<User | undefined> {
        const { rows } = await this.query<User>("INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *", [data.name, data.email, data.password]);
        return rows[0];
    }

    async findByEmail(email: string): Promise<User | null> {
        const { rows } = await this.query<User>("SELECT * FROM users WHERE email = $1", [email])
        return rows[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const { rows } = await this.query<User>("SELECT * FROM users WHERE id = $1", [id])
        return rows[0] || null;
    }

    async update(id: number, data: Partial<UserCreate>): Promise<User | null> {
        const { rows } = await this.query<User>("UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),password=COALESCE($3,password) WHERE id = $4 RETURNING *", [data.name, data.email, data.password, id])
        return rows[0] || null;
    }
    async delete(id: number): Promise<boolean> {
        const { rows } = await this.query("DELETE FROM users WHERE id = $1", [id])
        return rows.length > 0 ? true : false;
    }

    async getAll(): Promise<User[]> {
        const { rows } = await this.query<User>("SELECT * FROM users")
        return rows;
    }
}

export default UserRepository;