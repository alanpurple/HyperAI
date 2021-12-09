import { Router, Request, Response, NextFunction } from 'express';

const PROTO_PATH = __dirname + '/../../MLServer/lr.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import * as URI from '../uri.json';

const pkgdef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const LrService = loadPackageDefinition(pkgdef).lr;

const client = new LrService['Lr'](URI.grpcServer, credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);

router.post('/elasticnetcv', (req: Request, res: Response) =>
    client.elasticnetcv(req.body, (err, result) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }
        else if (result.error == 0)
            res.sendStatus(401);
        else if (result.error == -1) {
            delete result.error;
            res.send(result);
        }
        else
            res.sendStatus(500);
    })
);

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;