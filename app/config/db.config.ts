import dotenv from "dotenv";
dotenv.config();

let connectionString = process.env.DB_CONNECTION_STRING || "";
if (connectionString === "") {
  throw Error("Brak DB_CONNECTION_STRING");
}
connectionString = connectionString.split("//")[1];
const userAndPass = connectionString.split("@")[0];

export default {
  connectionLimit: 100,
  host: connectionString.split("@")[1].split(":")[0],
  user: userAndPass.split(":")[0],
  password: userAndPass.split(":")[1],
  database: connectionString.split("/")[1],
  multipleStatements: true,
};
