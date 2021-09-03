import { Router, Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize, sequelizeOpen } from '../connect-rdb';

import { DataInfo, DataInfoModel } from '../models/data.info';
const PROTO_PATH = __dirname + '/../../MLServer/eda.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { User, UserModel } from '../models/user';

const pkgdef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const EdaService = loadPackageDefinition(pkgdef).eda;

const client = new EdaService['Preprocess']('localhost:50051', credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);


// temporary 'type' parameter for known column types
// open = 0 for user data and 1 for open data
router.get('/relation/:open/:name/:source/:target/:type', (req, res) => {
    let dbLocation;
    const isOpen = parseInt(req.params.open);
    switch (isOpen) {
        case 0:
            if (req.user['accountType'] == 'admin')
                dbLocation = sequelizeOpen;
            else
                dbLocation = sequelize;
            break;
        case 1:
            dbLocation = sequelizeOpen;
            break;
        default:
            res.status(400).send('db open status should be 0 or 1, nothing else');
            return;
    }
    dbLocation.query('SELECT ' + req.params.source + ',' + req.params.target + ' FROM ' + req.params.name,
        { type: QueryTypes.SELECT })
        .then(data => {
            const src = req.params.source;
            const tgt = req.params.target;
            let result = {};
            const type = parseInt(req.params.type);
            switch (type) {
                //categorical to categorical
                case 0:
                    // make data for pie charts and bar charts
                    data.forEach(elem => {
                        if (elem[tgt] in result) {
                            if (elem[src] in result[elem[tgt]])
                                result[elem[tgt]][elem[src]]++;
                            else
                                result[elem[tgt]][elem[src]] = 1;
                        }
                        else {
                            result[elem[tgt]] = {};
                            result[elem[tgt]][elem[src]] = 1;
                        }
                    });
                    res.send(result);
                    break;
                //numeric to categorical
                case 1:
                    data.forEach(elem => {
                        if (!(elem[tgt] in result))
                            result[elem[tgt]] = [];
                    });
                    for (let target in result) {
                        const filtered = data.filter(elem => elem[tgt] == target);
                        result[target] = filtered.map(elem => elem[src]);
                    }
                    res.send(result);
                    break;
                default:
                    res.status(400).send('invalid type');
            }
        }).catch(err => {
            res.sendStatus(500);
        });
});

router.get('/cleanse/:name', (req: Request, res: Response) => {
    const user: User = req.user as User;
    if (user.accountType == 'admin') {
        res.status(400).send('sorry, this feature is not available for admin(maybe for now)');
        return;
    }
    client.cleanse({ location: req.params.name }, (err, result) => {
        if (err || result.error == 1) {
            if (err)
                console.error(err);
            res.sendStatus(500);
        }
        else if (result.error == 0) {
            res.sendStatus(400);
        }
        else {
            if (result.msg == 'cleansed') {
                if (!result.loc)
                    res.status(500).send('no loc for cleansed');
                else
                    UserModel.findByIdAndUpdate(req.user['_id'], { $push: { data:result.loc, cleansedData: result.loc } }).then(
                        () => res.send({
                            msg: result.msg,
                            table: result.loc
                        })).catch(err => {
                            console.error(err);
                            res.status(500).send(err);
                        });
            }
            else if (result.msg == 'clean')
                UserModel.findByIdAndUpdate(req.user['_id'], { $push: { data: result.loc, cleanData: result.loc } }).then(
                    () => res.send({
                        msg: result.msg
                    })).catch(err => {
                        console.error(err);
                        res.status(500).send(err);
                    });
            else
                res.status(500).send('unknown message');
        }
    });
});

router.get('/normlog/:name', (req: Request, res: Response) => {
    const user: User = req.user as User;
    if (user.accountType == 'admin') {
        res.status(400).send('sorry, this feature is not available for admin(maybe for now)');
        return;
    }
    const name = req.params.name;
    if (!user['data'].includes(name)) {
        res.status(401).send('User doesn\'t have this data');
        return;
    }
    else if (!user.cleanData.includes(name) && !user.cleansedData.includes(name)) {
        res.status(400).send('Data should be clean before applying preprocessor');
        return;
    }
    client.normLog({ location: name }, (err, result) => {
        if (err || result.error == 1) {
            if (err)
                console.error(err);
            res.sendStatus(500);
        }
        else if (result.error == 0) {
            res.sendStatus(400);
        }
        else
            UserModel.findByIdAndUpdate(req.user['_id'], { $push: { data: result.loc, preprocessedData: result.loc } }).then(
                () => res.send({
                    msg: result.msg,
                    table: result.loc
                })).catch(err => {
                    console.error(err);
                    res.status(500).send(err);
                });
    });
});

router.get('/describe/:isOpen/:name', async (req: Request, res: Response) => {
    const name = req.params.name;
    let isOpen = req.params.isOpen == '1' || req.user['accountType'] == 'admin';
    try {
        if (!isOpen && !req.user['data'].includes(name)) {
            res.status(400).send('no tables with name');
            return;
        }
        else if (isOpen) {
            let openData = await _getOpendata();
            if (!openData.includes(name)) {
                res.status(400).send('no tables with name');
                return;
            }
        }
        client.describe({ location: name, isOpen: isOpen }, (err, result) => {
            if (err || result.error == 1) {
                if (err)
                    console.error(err);
                res.sendStatus(500);
            }
            else if (result.error == 0) {
                res.sendStatus(400);
            }
            else
                res.send(result.summaries);
        });
    }
    catch (err) {
        if (err)
            res.status(500).send('err');
    }
});

async function _getOpendata() {
    const entireData = await DataInfoModel.find().populate('owner', 'accountType');
    const openData = entireData.filter(data => data.owner.accountType == 'admin').map(table => table._id);
    return openData;
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;