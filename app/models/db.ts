import mysql from "mysql2/promise";
import dbConfig from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const db = mysql.createPool({
  connectionLimit: dbConfig.connectionLimit,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  multipleStatements: dbConfig.multipleStatements,
});

const query = async (
  conn: mysql.PoolConnection,
  sql: string,
  params?: any[]
) => {
  try {
    const result = await conn.query<ResultSetHeader | RowDataPacket[]>(
      sql,
      params
    );
    return result[0];
  } catch (error) {
    throw error;
  }
};

export default query;
