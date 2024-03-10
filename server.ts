import dotenv from "dotenv";
import App from "./app";
import AuthController from "./app/controllers/auth/authController";

dotenv.config();

const port = process.env.PORT || "3000";

const controllers = [new AuthController()];

const app = new App(controllers, port);

app.listen();
