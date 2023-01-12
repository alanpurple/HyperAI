import {Request, Response, NextFunction} from 'express';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated()) {
        res.status(401).send({
            error: "User authentication failed."
        });
    } else {
        next();
    }
}

export function ensureAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated() || !req.user) {
        res.status(401).send({
            error: "User authentication failed."
        });
    } else {
        if (req.isAuthenticated() && (req.user["accountType"] === "admin")) {
            next();
        } else {
            res.status(401).send({
                error: "Access is denied for an unauthorized account."
            });
        }
    }
}