import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import query, { db } from "../../models/db";
import { MysqlError } from "mysql";

dotenv.config();
const secret: Secret = process.env.JWT_SECRET || "3129839128389219389878";

declare module "jsonwebtoken" {
  export interface UserIdJwtPayload extends jwt.JwtPayload {
    userId: number;
    userRole: string;
  }
}

export interface UserData {
  userId: number;
  userRole: string;
  // rolesArray: string[];
}

interface TokenPayload {
  userId: number;
  userLogin: string;
  userRole: string;
}

const getUserRole = async (userId: number) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();
  const sql = `SELECT role FROM user_roles WHERE user_id = ${db.escape(
    userId
  )}`;

  try {
    const roleRow = (await query(conn, sql)) as { role: string }[];
    if (roleRow.length === 0) {
      throw "404";
    }

    return roleRow;
  } catch (error) {
    throw error;
  }
};

export const getUserId = (token: string) => {
  const { userId } = <jwt.UserIdJwtPayload>jwt.verify(token, secret);
  return userId;
};

export const generateToken = (payload: TokenPayload) => {
  const expTime = "1h";

  return jwt.sign(payload, secret, { expiresIn: expTime });
};

export const verifyJWT = async (token: string) => {
  try {
    const { userId, userRole } = <jwt.UserIdJwtPayload>(
      jwt.verify(token, secret)
    );

    const roles = await getUserRole(userId);

    if (userRole !== roles[0].role) {
      throw "401";
    }

    return { userId, userRole: roles[0].role };
  } catch (error) {
    throw error as string;
  }
};
