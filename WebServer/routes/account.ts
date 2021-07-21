import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';
import { authenticate } from 'passport';

const router = Router();

router.get('/logout', ensureAuthenticated, (req: Request, res: Response) => {
    req.logout();
    res.redirect('/');
});

router.get('/info', (req: Request, res: Response) => {
    if (req.isAuthenticated())
        res.send(req.user);
    else
        res.sendStatus(401);
});

router.get('/checkLogin', (req: Request, res: Response) => {
    let result = false;
    let hasNickName = false;
    if (req.isAuthenticated()) {
        result = true;
        if (req.user['nickName'])
            hasNickName = true;
    }
    res.send({
        result: result,
        hasNickName: hasNickName
    });
});

router.get('/notLoggedIn', (req: Request, res: Response) => {
    if (req.isAuthenticated())
        res.sendStatus(400);
    else
        res.send('not logged in');
});

router.get('/hasNoNick', (req: Request, res: Response) => {
    if (!req.isAuthenticated())
        res.send('notloggedin');
    else if (req.user['nickName'])
        res.send('hasnick');
    else
        res.send('hasnonick');
});

//Authenticate Admin account
router.get('/admin', ensureAuthenticated, (req: Request, res: Response) => {
    if (req.user['accountType'] == 'admin')
        res.sendStatus(200);
    else
        res.sendStatus(401);
});

router.get('/checkNickName/:nickName', (req: Request, res: Response) => {
    UserModel.findOne( { nickName: req.params.nickName } )
        .then(user => {
            if (user)
                res.send('DUPLICATE');
            else
                res.send('AVAILABLE');
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
});

router.get('/checkUser/:id', (req: Request, res: Response) => {
    UserModel.findOne({ email: decodeURI(req.params.id) })
        .then(user => {
        if (!user)
            res.sendStatus(404);
        else
            res.send('User already exists')
    }).catch(err => {
        console.error(err);
        res.sendStatus(500);
    });
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;