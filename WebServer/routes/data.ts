import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';
import { DataInfoModel } from '../models/data.info';
import { sequelize, sequelizeOpen } from 'connect-rdb';

const router = Router();

router.all('*', ensureAuthenticated);

// get the list of open datasets
router.get('/open', async (req: Request, res: Response) => {
    const openData = await DataInfoModel.find({ owner: 0 });
})

// users' datasets
router.get('/', async (req: Request, res: Response) => {
    try {
        const UserData = await UserModel.findById(req.user['email']);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// get actual data from rdb
router.get('/:tablename', async (req: Request, res: Response) => {
    ////////////
    //Todo: check authentication ( actual owner )
    ////////////
    try {
        const tableName = req.params.tablename;
        const dataInfo = await DataInfoModel.findOne({ name: tableName });
        const ownerId = dataInfo.owner;
        const data =
            ownerId != 0 ?
                await sequelize.query('SELECT * FROM `' + tableName + '`')
                : await sequelizeOpen.query('SELECT * FROM `' + tableName + '`');
        res.send({ data: data });
    }
    catch (err) {
        res.status(500).send(err);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        if (!('file' in req.body)) {
            res.status(400).send('no file');
            return;
        }
        const file = req.body.file;
    }
    catch (err) {
        res.status(500).send(err);
    }
})

router.post('/public', async (req: Request, res: Response) => {
    try {
        if (!('file' in req.body)) {
            res.status(400).send('no file');
            return;
        }
        const file = req.body.file;
    }
    catch (err) {
        res.status(500).send(err);
    }
})

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;