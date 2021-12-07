import { Router, Request, Response, NextFunction } from 'express';
import * as URI from '../../uri.json';

const router = Router();

router.all('*', ensureAuthenticated);

class segTrainOptions {
    batch_size: number = 64;
    amp: boolean = false;
    no_xla: boolean = false;
}
class segPrepOptions {
    storageType: 'local' | 'azure blob' | 'aws s3' | 'smb' = 'local';
    include_mask: boolean = false;
    train_dir: string = '';
    val_dir: string = '';
    test_dir: string = '';
    useAnnotations: boolean = false;
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isUnauthenticated())
        res.status(401).send('unauthorized');
    else
        next();
}

export default router;