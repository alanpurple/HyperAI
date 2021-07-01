import { Router, Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize, sequelizeOpen } from 'connect-rdb';

const PROTO_PATH = __dirname + '/../../MLServer/eda.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const pkgdef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const Preprocess = loadPackageDefinition(pkgdef).eda['Preprocess'];

const client = new Preprocess('localhost:50051', credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);


// temporary 'type' parameter for known column types
// open = 0 for user data and 1 for open data
router.get('/relation/:open/:name/:source/:target/:type', (req, res) => {
    let dbLocation;
    const isOpen = parseInt(req.params.open);
    switch (isOpen) {
        case 0:
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
                        let filtered = data.filter(elem => elem[tgt] == target);
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
    try {
        const response = await client.cleanse({ location: req.params.name });
        if (response.error == 0)
            res.sendStatus(400);
        else if (response.error == 1)
            res.sendStatus(500);
        else
            res.send({
                msg: response.msg,
                table: response.loc
            });
    }
    catch (err) {
        res.status(500).send(err);
    }
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;