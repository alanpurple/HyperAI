import { Router, Request, Response, NextFunction } from 'express';
import { UserModel, User } from '../models/user';
import * as passport from 'passport';

const router = Router();

router.post('/login', (req: Request, res: Response, next: NextFunction)=> {
    UserModel.findOne({ email: req.body.username }).then(user => {
        if (!user)
            res.redirect('/signup');
        else
            next();
    }).catch(err => {
        console.error(err);
        res.redirect('/');
    });
},
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        // email verification not implemented for now
        /*if (!req.user['emailVerified'])
            res.redirect('/emailVerification');
        else */if (!req.user['nickName'])
            res.redirect('/user-info');
        //else if (req.user.accountType == 'admin')
        //    res.redirect('/admin');
        else
            res.redirect('/');
    });

router.post('/signup', (req: Request, res: Response, next: NextFunction) => {
    UserModel.findOne({ email: req.body.username }).then(user => {
        if (!user)
            next();
        else
            res.redirect('/login/' + encodeURI(req.body.username));
    }).catch(err => {
        console.error(err);
        res.redirect('/');
    });
},
    passport.authenticate('local', {
        successRedirect: '/user-info',
        failureRedirect: '/signup',
        passReqToCallback: true
    }));

const ALL_ORGANIZATIONS = ['infinov', 'namutech', 'samsung', 'hynix'];

router.get('/all-organization', (req: Request, res: Response) => {
    res.send(ALL_ORGANIZATIONS);
})

router.put('/', (req: Request, res: Response) => {
    if (!('nickName' in req.body)) {
        res.status(400).send('only nickname can be modified or created for now');
        return;
    }
    UserModel.findByIdAndUpdate(req.user['_id'], { nickName: req.body['nickName'] }).then(
        () => res.send('nickname updated')
    ).catch(err => {
        console.error(err);
        res.status(500).send(err)
    });
});

router.get('/logout', ensureAuthenticated, (req: Request, res: Response) => {
    req.logout();
    res.redirect('/');
});

router.get('/info', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const user: User = req.user as User;
        res.send({
            name: user.name,
            organization: user.organization,
            nickName: user.nickName,
            hasNickName: user.hasNickName,
            accountType: user.accountType,
            email: user.email,
            data: user.data
        });
    }
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

router.get('/notadmin', ensureAuthenticated, (req: Request, res: Response) => {
    if (req.user['accountType'] == 'admin')
        res.sendStatus(401);
    else
        res.sendStatus(200);
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

router.get('/colleagues', (req: Request, res: Response) => {
    const user = req.user as User;
    UserModel.find({ organization: user.organization, email: { $ne: user.email } }, 'email').then(
        users => {
            if (users.length < 1)
                res.sendStatus(404);
            else {
                const userlist = users.map(user => user.email);
                res.send(userlist);
            }
        }
    )
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;