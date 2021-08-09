import { Router, Request, Response, NextFunction } from 'express';

const PROTO_PATH = __dirname + '/../../MLServer/lr.proto';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const pkgdef = loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});

const LrService = loadPackageDefinition(pkgdef).lr;

const client = new LrService['Elasticnetcv']('localhost:50051', credentials.createInsecure());

const router = Router();

router.all('*', ensureAuthenticated);

router.post('/elasticnetcv', (req: Request, res: Response) => {

})

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;