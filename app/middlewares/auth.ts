import { NextFunction, Request, Response } from "express";
import { UserData, verifyJWT } from "../helpers/auth/jwt";

export const Roles = {
  Admin: ["Admin"],
};

const isAuthorized = (roles: string[], userRole: string) =>
  roles.includes(userRole);

function auth(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token == null) {
        return res.sendStatus(401);
      }

      const { userId, userRole } = await verifyJWT(token);
      if (!isAuthorized(roles, userRole)) {
        console.log("role error", `expected ${roles}`, `passed ${userRole}`);
        return res.sendStatus(401);
      }

      req.user = { userId, userRole };

      next();
    } catch (error) {
      return res.sendStatus(401);
    }
  };
}

export default auth;
