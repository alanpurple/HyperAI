import * as express from 'express';
import { constants } from 'fs';
import { mkdir, access } from 'fs/promises';
import { AddressInfo } from "net";
import * as path from 'path';
import { connectDdb } from './connect-ddb';
import favicon = require('serve-favicon');
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import { UserModel } from 'models/user';
const MongoStore = require('connect-mongo');
import * as session from 'express-session';
import DataRoute from 'routes/data';
import EdaRoute from 'routes/eda';
import EdaTextRoute from 'routes/eda-text';
import EdaVisionRoute from 'routes/eda-vision';



const debug = require('debug')('my express app');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

connectDdb().then(() => console.log('document db connected')).catch(err => console.error(err));

UserModel.findById(1).then(user => {
    if (!user) {
        return UserModel.create({
            id: 1,
            email: 'alan@infinov.com',
            nickName: 'alanracer',
            accountType: 'admin',
            password: 'testadmin'
        });
    }
    else
        return;
});

UserModel.findById(2).then(user => {
    if (!user) {
        return UserModel.create({
            id: 2,
            email: 'alanpurple@gmail.com',
            nickName: 'retriever',
            accountType: 'user',
            password: 'testuser'
        });
    }
    else
        return;
});

const rootPath = path.join(__dirname, '../HyperAI/dist/HyperAI');

// no authentication for mongodb currently, need to be updated
const options = {
    mongoUrl: 'mongodb://localhost/hyperai',
    ttl: 24 * 60 * 60
};

const sessionStore = MongoStore.create(options);

app.use(session({
    name: 'ai_cookie',
    secret: 'do not need to know',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

import passport from './passport-init';

app.use(passport.initialize());
app.use(passport.session());

access('upload-temp').then(() => console.log('temp upload directory is ok.'))
    .catch(err => {
        if (err.code == 'ENOENT')
            mkdir('upload-temp')
                .then(() => console.log('temp upload directory created'))
                .catch(err => console.error(err));
        else
            console.error('something\'s wrong, cannot access or create temp upload directory');
    });

app.use(favicon('./favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get(['/', '/data-manager/?', '/login/?', '/signup/?', 'admin/?', 'info',
    '/description/?', '/model-suggestion/?', '/train-manager/?', '/eda-manager/?'],
    (req, res) => res.sendFile(path.join(rootPath, 'index.html')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
app.use('/data', DataRoute);
app.use('/eda', EdaRoute);
app.use('/eda-text', EdaTextRoute);
app.use('/eda-vision', EdaVisionRoute);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(err[ 'status' ] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    debug(`Express server listening on port ${(server.address() as AddressInfo).port}`);
});