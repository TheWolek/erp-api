import express, { Request, Response } from "express";
import auth, { Roles } from "../../middlewares/auth";
import AuthModel from "../../models/auth/authModel";
import { LoginData, RegisterAccountData } from "../../models/auth/constants";
import { db } from "../../models/db";
import validators from "./validators";
import throwGenericError from "../../helpers/throwGenericError";
import { ResultSetHeader } from "mysql2";

class AuthController {
  public path = "/auth";
  public router = express.Router();

  constructor() {
    this.initRoutes();
    console.log(`Controller ${this.path} initialized`);
  }

  private initRoutes() {
    this.router.post(
      `${this.path}/register`,
      // auth(Roles.Admin),
      this.createNewAccount
    );

    this.router.post(`${this.path}/login`, this.login);
  }

  private Model = new AuthModel();

  createNewAccount = async (
    req: Request<{}, {}, RegisterAccountData>,
    res: Response
  ) => {
    const { error } = validators.createAccount.validate(req.body);

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message);
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const dbRes = (await this.Model.createAccount(
        conn,
        req.body
      )) as ResultSetHeader;

      conn.commit();

      return res.status(200).json({
        userId: dbRes.insertId,
      });
    } catch (error) {
      if (typeof error === "string") {
        return throwGenericError(res, 400, error);
      }

      conn.rollback();
      return throwGenericError(res, 500, String(error), error);
    } finally {
      conn.release();
    }
  };

  login = async (req: Request<{}, {}, LoginData>, res: Response) => {
    const { error } = validators.login.validate(req.body);

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message);
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const loginRes = await this.Model.login(conn, req.body);

      if (!loginRes) {
        return throwGenericError(res, 400, "Błędne hasło lub email");
      }

      conn.commit();
      return res.status(200).json({
        token: loginRes,
      });
    } catch (error) {
      if (typeof error === "string") {
        if (error === "CHANGE_PASSWORD") {
          return throwGenericError(res, 400, "Zmień pierwsze hasło");
        }

        return throwGenericError(res, 400, error);
      }

      conn.rollback();
      return throwGenericError(res, 500, String(error), error);
    } finally {
      conn.release();
    }
  };
}

export default AuthController;
