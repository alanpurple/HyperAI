import { Router, Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize, sequelizeOpen } from '../connect-rdb';

const PROTO_PATH = __dirname + '/../../MLServer/eda.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { User, UserModel } from '../models/user';
import * as URI from '../uri.json';

const pkgdef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const EdaService = loadPackageDefinition(pkgdef).eda;

const client = new EdaService['Preprocess'](URI.grpcServer, credentials.createInsecure());

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

router.get('/cleanse/:name', async (req: Request, res: Response) => {
    const user: User = req.user as User;
    const name = req.params.name;
    if (user.accountType == 'admin') {
        res.status(400).send('sorry, this feature is not available for admin(maybe for now)');
        return;
    }
    let data = user.data.find(elem => elem.name == name);
    if (!data) {
        res.status(404).send('no data with that name');
        return;
    }
    if (data.cleansed) {
        res.status(400).send('already cleand, no need to cleanse');
        return;
    }
    if (data.isClean) {
        res.status(400).send('clean data, no need to cleanse');
        return;
    }
    try {
        client.cleanse({ location: name }, async (err, result) => {
            if (err || result.error == 1) {
                if (err)
                    console.error(err);
                res.sendStatus(500);
            }
            else if (result.error == 0) {
                res.sendStatus(400);
            }
            else {
                try {
                    const msg = result.msg;
                    if (msg == 'cleansed') {
                        if (!result.loc)
                            res.status(500).send('no loc for cleansed');
                        else {
                            const tablename = result.loc;
                            await UserModel.findOneAndUpdate({ email: user.email }, {
                                'data.$[elem].cleansed': {
                                    name: tablename,
                                    numRows: result.numRows
                                }
                            }, { arrayFilters: [{ 'elem.name': name }] });
                            res.send({
                                msg: msg,
                                table: tablename,
                                numRows: result.numRows
                            });
                        }
                    }
                    else if (msg == 'clean') {
                        await UserModel.findOneAndUpdate({ email: user.email },
                            { 'data.$[elem].isClean': true }, { arrayFilters: [{ 'elem.name': name }] });
                        res.send({
                            msg: msg
                        });
                    }
                    else
                        throw new Error('unknown message: ' + msg);
                }
                catch (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/normlog/:name', async (req: Request, res: Response) => {
    const user: User = req.user as User;
    if (user.accountType == 'admin') {
        res.status(400).send('sorry, this feature is not available for admin(maybe for now)');
        return;
    }
    const name = req.params.name;


    let data = user.data.find(elem => {
        if (elem.cleansed) {
            if (elem.cleansed.name == name)
                return true;
            else
                return false;
        }
        else if (elem.name == name && elem.isClean)
            return true;
        else
            return false;
    });
    if (!data) {
        res.status(404).send('no data with that name');
        return;
    }
    if (data.preprocessed) {
        res.status(400).send('already preprocessed');
        return;
    }
    try {
        client.normLog({ location: name }, async (err, result) => {
            if (err || result.error == 1) {
                if (err)
                    console.error(err);
                res.sendStatus(500);
            }
            else if (result.error == 0) {
                res.sendStatus(400);
            }
            else {
                try {
                    const userData = await UserModel.findOne({ email: user.email });
                    let targetDataId = userData.data.findIndex(elem => {
                        if (elem.cleansed) {
                            if (elem.cleansed.name == name)
                                return true;
                            else
                                return false;
                        }
                        else if (elem.name == name && elem.isClean)
                            return true;
                        else
                            return false;
                    });
                    if (targetDataId < 0)
                        throw new Error('data integration failed');
                    userData.data[targetDataId].preprocessed = {
                        name: result.loc,
                        numRows: result.numRows
                    };
                    await userData.save();
                    res.send({
                        msg: result.msg,
                        table: result.loc,
                        numRows: result.numRows
                    });
                }
                catch (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/describe/:isOpen/:name', async (req: Request, res: Response) => {
    const name = req.params.name;
    const user = req.user as User;
    let isOpen = req.params.isOpen == '1' || req.user['accountType'] == 'admin';
    const userDataList = user.data.flatMap(elem => {
        let result = [elem.name];
        if (elem.cleansed) result.push(elem.cleansed.name);
        if (elem.preprocessed) result.push(elem.preprocessed.name);
        return result;
    });
    try {
        if (!isOpen && !userDataList.includes(name)) {
            res.status(400).send('no tables with name');
            return;
        }
        else if (isOpen) {
            let openData = await _getOpendatalist();
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

async function _getOpendatalist() {
    const admins = await UserModel.find({ accountType: 'admin' });
    return admins.flatMap(elem => elem.data).flatMap(data => {
        let nested = [data.name];
        if (data.cleansed) nested.push(data.cleansed.name);
        if (data.preprocessed) nested.push(data.preprocessed.name);
        return nested;
    });
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;