import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';

const router = Router();

router.all('*', ensureAuthenticated);

// get the list of open datasets
router.get('/open', async (req: Request, res: Response) => {

})

// users' datasets
router.get('/', async (req: Request, res: Response) => {
    try {
        const UserData = await UserModel.findById(req.user['email']);
    }
    catch (err) {
        res.status(400).send(err);
    }
})

router.get('/:tablename', (req: Request, res: Response) => {

})

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;