import { Router, Request, Response, NextFunction } from 'express';
import { User,UserModel } from '../models/user';
import { sequelize, sequelizeOpen } from '../connect-rdb';
import { QueryTypes } from 'sequelize';
import { rm } from 'fs/promises';
import multer = require('multer');

const UPLOAD_TEMP_PATH = '../upload-temp';

const multerRead = multer({ dest: UPLOAD_TEMP_PATH });

const PROTO_PATH = __dirname + '/../../MLServer/data_service.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const pkgDef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const DataService = loadPackageDefinition(pkgDef).dataservice;

const client = new DataService['Data']('192.168.0.2:50051', credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);

// get the list of open datasets
router.get('/open', async (req: Request, res: Response) => {
    try {
        const openData = await _getOpendata();
        const result = openData.map(data => {
            return {
                name: data.name,
                numRows: data.numRows,
                //temporary fixed type
                type: 'structural'
            }
        });
        res.send(result);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

router.get('/compact/:isopen/:name/:attr1/:attr2', (req, res) => {
    const database = req.params.isopen == '1' ? sequelizeOpen : sequelize;
    database.query('SELECT ' + req.params.attr1 + ',' + req.params.attr2 +
        ' FROM ' + req.params.name,
        { type: QueryTypes.SELECT })
        .then(data => {
            if (data.length == 0)
                res.sendStatus(404);
            else if (data.length < 400)
                res.send({ data: data, base: 1 });
            else {
                let reducer = Math.floor(data.length / 300);
                let reduced = [];
                data.forEach((elem, index, arr) => {
                    if (index % reducer == 0)
                        reduced.push(elem);
                });
                res.send({ data: reduced, base: reducer });
            }
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
});

// users' datasets
router.get('/', async (req: Request, res: Response) => {
    const user = req.user as User;
    const userData = user.data.flatMap(elem => {
        let data = [{ name: elem.name, numRows: elem.numRows }];
        if (elem.cleansed) data.push(elem.cleansed);
        if (elem.preprocessed) data.push(elem.preprocessed);
        return data;
    });
    const result = userData.map(data => {
        return {
            name: data.name,
            numRows: data.numRows,
            // only structural is avilable in this context (hopefully for now)
            type: 'structural'
        }
    });
    res.send(result);
});

// get actual data from rdb
router.get('/:tablename', async (req: Request, res: Response) => {
    ////////////
    //Todo: check authentication ( actual owner )
    ////////////
    const user = req.user as User;
    const tableName = req.params.tablename;
    let isOpen = false;
    if (user.accountType != 'admin') {
        const userData = user.data.flatMap(data => {
            let nested = [data.name];
            if (data.cleansed) nested.push(data.cleansed.name);
            if (data.preprocessed) nested.push(data.preprocessed.name);
            return nested;
        });
        if (!userData.includes(tableName))
            isOpen = true;
    }
    try {
        if (isOpen) {
            const openData = await _getOpendatalist();
            if (!openData.includes(tableName)) {
                res.sendStatus(400);
                return;
            }
        }

        const database = isOpen ? sequelizeOpen : sequelize;
        const result = await database.query('SELECT * FROM `' + tableName + '`');
        res.send({ data: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

const AvailableExts = ['csv', 'xlsx', 'tsv'];

router.get('/ext', (req: Request, res: Response) => res.send({ ext: AvailableExts }));

router.post('/', multerRead.single('data'), (req: Request, res: Response) => {
    const filename = req.file.originalname;
    const splited = filename.split('.');
    if (splited.length != 2) {
        res.status(400).send('filename can include only one dot');
        return;
    }
    const tempName = req.file.filename;
    const ext = splited[1];
    const name = splited[0];
    if (!AvailableExts.includes(ext)) {
        res.status(400).send('We only support ' + AvailableExts.toString());
        return;
    }
    const isAdmin = req.user['accountType'] == 'admin';
    const userId = req.user['_id'];
    client.Upload({
        location: tempName, name: name, extname: ext,
        isadmin: isAdmin
    }, async (err, result) => {
        try {
            await rm(UPLOAD_TEMP_PATH + '/' + req.file.filename);
            if (err || result.error > -1) {
                if (err)
                    console.error(err);
                res.sendStatus(500);
                return;
            }
            const tableName = result.tablename;
            await UserModel.findByIdAndUpdate(userId, {
                $push: {
                    data: {
                        name: tableName,
                        numRows: result.numrows,
                        // only 'structural' is available for now
                        type: 'structural'
                    }
                }
            });

            res.send({ name: tableName, numRows: result.numRows, type: 'structural' });
        }
        catch (err) {
            console.error(err);
            res.status(500).send(err)
        }
    });
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

async function _getOpendata() {
    const admins = await UserModel.find({ accountType: 'admin' });
    return admins.flatMap(elem => elem.data).flatMap(data => {
        let nested = [{ name: data.name, numRows: data.numRows }];
        if (data.cleansed) nested.push(data.cleansed);
        if (data.preprocessed) nested.push(data.preprocessed);
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