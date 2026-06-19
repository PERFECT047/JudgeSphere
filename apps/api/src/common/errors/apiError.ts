import { HttpStatus } from "../constants/httpStatus";

export class ApiError extends Error {
  statusCode: HttpStatus;

  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
