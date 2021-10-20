import {Request, Response, NextFunction} from 'express';
import {ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode,} from 'http-status-codes';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated()) {
        res.status(StatusCodes.UNAUTHORIZED).send({
            error: "User authentication failed."
        });
    } else {
        next();
    }
}