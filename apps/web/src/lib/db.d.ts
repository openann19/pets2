import { Db, MongoClient } from 'mongodb';
export type DbConnections = {
    client: MongoClient;
    db: Db;
    users: ReturnType<Db['collection']>;
    pets: ReturnType<Db['collection']>;
    matches: ReturnType<Db['collection']>;
    messages: ReturnType<Db['collection']>;
    accountActions: ReturnType<Db['collection']>;
    dataExports: ReturnType<Db['collection']>;
};
export declare function connectToDB(): Promise<DbConnections>;
export declare function closeDbConnection(): Promise<void>;
export declare function generateId(prefix?: string): string;
//# sourceMappingURL=db.d.ts.map