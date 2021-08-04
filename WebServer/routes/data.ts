import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';
import { DataInfo, DataInfoModel } from '../models/data.info';
import { sequelize, sequelizeOpen } from '../connect-rdb';
//import { extname } from 'path';
import { rm } from 'fs/promises';
//import * as csvParse from 'csv-parse';
//import * as XLSX from 'xlsx';
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

const client = new DataService['Data']('localhost:50051', credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);

// get the list of open datasets
router.get('/open', async (req: Request, res: Response) => {
    try {
        const entireData = await DataInfoModel.find().populate('owner', 'accountType');
        entireData.forEach(data => console.dir(data.owner));
        const openData = entireData.filter(data => data.owner.accountType == 'admin');
        const result = openData.map(data => {
            return {
                name: data._id,
                numRows: data.numRows,
                type: data.type
            }
        });
        res.send(result);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// users' datasets
router.get('/', async (req: Request, res: Response) => {
    try {
        const UserData = await UserModel.findById(req.user['id'], 'data');
        const result = UserData.data;
        res.send(result);
    }
    catch (err) {
        res.status(500).send(err);
    }
});

/*router.get('/public', async (req: Request, res: Response) => {
    try {
        const admins = await UserModel.find({ accountType: 'admin' }, 'data')
        let result = [];
        admins.forEach(userdata => result.concat(userdata.data));
        res.send(result);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
*/
// get actual data from rdb
router.get('/:tablename', (req: Request, res: Response) => {
    ////////////
    //Todo: check authentication ( actual owner )
    ////////////
    const tableName = req.params.tablename;
    DataInfoModel.findOne({ name: tableName }).populate('owner', 'accountType').orFail()
        .then((dataInfo: DataInfo) => {
            const owner = dataInfo.owner.accountType;
            if (owner == 'admin')
                sequelizeOpen.query('SELECT * FROM `' + tableName + '`').then(data => res.send({ data: data }));
            else if (owner == 'user')
                sequelize.query('SELECT * FROM `' + tableName + '`').then(data => res.send({ data: data }));
            else {
                console.error('somethings wrong, account type is not usual: ' + owner);
                res.sendStatus(500);
            }
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
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

    client.Upload({
        location: tempName, name: name, extname: ext,
        isadmin: req.user['accountType'] == 'admin'
    }, async (err, result) => {
        try {
            await rm(UPLOAD_TEMP_PATH + '/' + req.file.filename);
            if (err || result.error > -1) {
                if (err)
                    console.error(err);
                res.sendStatus(500);
                return;
            }
            const data: DataInfo = {
                _id: result.tablename,
                numRows: result.numrows,
                owner: req.user['id'],
                // only 'structural' is available for now
                type: 'structural'
            };

            const dataInfoModel = new DataInfoModel(data);
            await dataInfoModel.save();
            res.send({ name: data._id, numRows: data.numRows, type: data.type });
        }
        catch (err) {
            console.error(err);
            res.status(500).send(err)
        }
    });
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;