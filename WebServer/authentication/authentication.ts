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

export function ensureAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated() || !req.user) {
        res.status(StatusCodes.UNAUTHORIZED).send({
            error: "User authentication failed."
        });
    } else {
        if (req.isAuthenticated() && (req.user["accountType"] === "admin")) {
            next();
        } else {
            res.status(StatusCodes.FORBIDDEN).send({
                error: "Access is denied for an unauthorized account."
            });
        }
    }
}