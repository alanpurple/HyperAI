import {StatusCodes} from "http-status-codes";

export interface IResponseData {
    success: boolean,
    code: StatusCodes,
    message: string,
    count: number,
    data: object
}

export class ResponseData implements IResponseData {
    success: boolean;
    code: StatusCodes;
    message: string;
    count: number;
    data: {}
}