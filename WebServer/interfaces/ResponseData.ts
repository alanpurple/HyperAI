export interface IResponseData {
    success: boolean,
    code: number,
    message: string,
    count: number,
    data: object
}

export class ResponseData implements IResponseData {
    success: boolean;
    code: number;
    message: string;
    count: number;
    data: {}
}