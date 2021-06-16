import { Router,Request,Response,NextFunction } from 'express';

const router = Router();

router.all('*', ensureAuthenticated);

router.get('/:tablename', (req: Request, res: Response) => {

})

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}