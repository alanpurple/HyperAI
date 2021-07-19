import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';
import { DataInfo, DataInfoModel } from '../models/data.info';
import { sequelize, sequelizeOpen } from '../connect-rdb';
import { extname } from 'path';
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
        const openData = await DataInfoModel.find({ owner: 0 });
        const result = openData.map(data => {
            name: data._id;
            numRows: data.numRows;
            type: data.type
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
        const UserData = await UserModel.findById(req.user['id']);
        res.send(UserData);
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

const AvailableExts = ['csv', 'xlsx', 'tsv'];

router.post('/', multerRead.single('data'), async (req: Request, res: Response) => {
    try {
        const filename = req.file.filename;
        const ext = extname(filename);

        if (!AvailableExts.includes(ext)) {
            res.status(400).send('We only support ' + AvailableExts.toString());
            return;
        }

        //let data;
        /*switch (ext) {
            case 'csv':
                csvParse(req.file.buffer, { columns: true }, (err, output) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }

                })

                break;

            case 'tsv':
                csvParse(req.file.buffer, { delimiter: '\t', columns: true }, (err, output) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                })
                break;

            case 'xlsx':
                data = XLSX.read(req.file.buffer)

                break;
        }*/

        const response = await client.upload({ name: filename });
        if (response.error > -1) {
            res.sendStatus(500);
            return;
        }
        await rm(UPLOAD_TEMP_PATH + '/' + filename);

        const data: DataInfo = {
            _id: filename.split('.')[0],
            numRows: req.file.buffer.length,
            owner: req.user['id'],
            // only 'structural' is available for now
            type: 'structural'
        };

        const dataInfoModel = new DataInfoModel(data);
        await dataInfoModel.save();
        res.send({ name: data._id, numRows: data.numRows, type: data.type });
    }
    catch (err) {
        res.status(500).send(err);
    }
})

router.post('/public', multerRead.single('data'), async (req: Request, res: Response) => {
    try {
        const filename = req.file.filename;
        const ext = extname(filename);

        if (!AvailableExts.includes(ext)) {
            res.status(400).send('We only support ' + AvailableExts.toString());
            return;
        }

        //let data;
        /*switch (ext) {
            case 'csv':
                csvParse(req.file.buffer, { columns: true }, (err, output) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    
                })

                break;

            case 'tsv':
                csvParse(req.file.buffer, { delimiter: '\t', columns: true }, (err, output) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                })
                break;

            case 'xlsx':
                data = XLSX.read(req.file.buffer)

                break;
        }*/

        const response = await client.upload({ name: filename });
        if (response.error > -1) {
            res.sendStatus(500);
            return;
        }
        await rm(UPLOAD_TEMP_PATH + '/' + filename);
        const data: DataInfo = {
            _id: filename.split('.')[0],
            numRows: req.file.buffer.length,
            owner: req.user['id'],
            // only 'structural' is available for now
            type: 'structural'
        };

        const dataInfoModel = new DataInfoModel(data);
        await dataInfoModel.save();
        res.send({ name: data._id, numRows: data.numRows, type: data.type });

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