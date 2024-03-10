import { userData } from "./app/helpers/auth/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: userData;
    }
  }
}
