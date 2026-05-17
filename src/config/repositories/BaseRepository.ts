import type { PoolClient, QueryResult } from 'pg';
import Database from '../db';

export abstract class BaseRepository {
    protected db = Database.getInstance();

    protected async query<T = any>(
        text: string,
        params?: any[],
        client?: PoolClient
    ): Promise<QueryResult<T>> {
        if (client) {
            return client.query<T>(text, params);
        }
        return this.db.query<T>(text, params);
    }

    protected async withTransaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        return this.db.withTransaction(callback);
    }
}

export default BaseRepository;