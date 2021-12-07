import { Router, Request, Response, NextFunction } from 'express';
import * as URI from '../../uri.json';

const router = Router();

router.all('*', ensureAuthenticated);

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;