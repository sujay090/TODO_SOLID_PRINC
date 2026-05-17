import type { User, UserCreate } from "../config/repositories/UserRepository";

export interface IUserRepository {
    create(data: UserCreate): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: Partial<UserCreate>): Promise<User | null>;
    delete(id: number): Promise<boolean>;
    getAll(): Promise<User[]>;
}
