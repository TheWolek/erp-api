import { Response } from "express";
import { MysqlError } from "mysql";

interface error {
  message: string | MysqlError;
}

export default (
  res: Response,
  errorCode: number,
  errorMessage: string | MysqlError,
  debug: any = null
) => {
  if (debug !== null) {
    console.log(debug);
  }

  const error: error = {
    message: errorMessage,
  };

  res.status(errorCode).json(error);
};
