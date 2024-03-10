import bcrypt from "bcryptjs";
import mysql, { ResultSetHeader } from "mysql2/promise";
import query, { db } from "../db";
import { LoginData, RegisterAccountData, UserLoginData } from "./constants";
import { generateToken } from "../../helpers/auth/jwt";

class AuthModel {
  private SQL_SELECT_USER = `SELECT u.user_id, u.login, u.password, ur.role, u.change_password FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.deleted = 0 AND u.login =`;

  private hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  private isPasswordValid = async (inputPassword: string, hash: string) =>
    await bcrypt.compare(inputPassword, hash);

  private checkIfUserExists = async (
    conn: mysql.PoolConnection,
    login: string
  ) => {
    const sql = `SELECT login FROM users WHERE login = ${db.escape(login)}`;

    try {
      const rows = (await query(conn, sql)) as { login: string }[];

      if (rows.length > 0) {
        throw "Podany login jest już zajęty";
      }

      return rows;
    } catch (error) {
      throw error;
    }
  };

  private createUser = async (
    conn: mysql.PoolConnection,
    login: string,
    password: string
  ) => {
    const sql = `INSERT INTO users (login, password, change_password) VALUES (?,?,?)`;
    const params = [login, password, 1];

    try {
      return (await query(conn, sql, params)) as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };

  private logLastLogin = async (conn: mysql.PoolConnection, userId: number) => {
    const sql = `UPDATE users SET last_login_date = NOW() WHERE user_id = ${db.escape(
      userId
    )}`;

    try {
      await query(conn, sql);
      return;
    } catch (error) {
      throw error;
    }
  };

  public createAccount = async (
    conn: mysql.PoolConnection,
    registerData: RegisterAccountData
  ) => {
    try {
      const user = await this.checkIfUserExists(conn, registerData.login);
      const hashedPassword = await this.hashPassword(registerData.password);

      const createRes = await this.createUser(
        conn,
        registerData.login,
        hashedPassword
      );

      const role_sql = `INSERT INTO user_roles (user_id, role) VALUES (?,?)`;
      const params = [createRes.insertId, registerData.role];

      return await query(conn, role_sql, params);
    } catch (error) {
      throw error;
    }
  };

  public login = async (conn: mysql.PoolConnection, loginData: LoginData) => {
    const sql = `${this.SQL_SELECT_USER} ${db.escape(loginData.login)}`;

    try {
      const rows = (await query(conn, sql)) as UserLoginData[];

      if (rows.length === 0) {
        throw "Błędne hasło lub login";
      }

      if (!this.isPasswordValid(loginData.password, rows[0].password)) {
        throw "Błędne hasło lub login";
      }

      if (rows[0].change_password === 1) {
        throw "CHANGE_PASSWORD";
      }

      this.logLastLogin(conn, rows[0].user_id);
      return generateToken({
        userId: rows[0].user_id,
        userLogin: rows[0].login,
        userRole: rows[0].role,
      });
    } catch (error) {
      throw error;
    }
  };
}

export default AuthModel;
