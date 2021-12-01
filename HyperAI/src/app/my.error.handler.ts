import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler } from "@angular/core";

export class MyErrorHandler implements ErrorHandler {
  handleError(error: any) {
    if (!(error instanceof HttpErrorResponse))
      console.error(error);
  }
}
