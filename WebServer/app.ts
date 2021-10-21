import * as express from 'express';
import { constants, createWriteStream } from 'fs';
import { mkdir, access } from 'fs/promises';
import { AddressInfo } from "net";
import * as path from 'path';
import { connectDdb } from './connect-ddb';
import favicon = require('serve-favicon');
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import { UserModel } from './models/user';
const MongoStore = require('connect-mongo');
import * as session from 'express-session';
import DataRoute from './routes/data';
import EdaRoute from './routes/eda';
import EdaTextRoute from './routes/eda-text';
import EdaVisionRoute from './routes/eda-vision';
import AccountRoute from './routes/account';
import LrRoute from './routes/lr';
import ProjectRoute from './routes/project';

import * as swaggerUi from 'swagger-ui-express';
import * as swaggerJSDoc from 'swagger-jsdoc';
import {swaggerOptions} from "./openapi/swagger";


const debug = require('debug')('my express app');
const app = express();

//app.use(express.static(path.join(__dirname, 'public')));

connectDdb().then(() => console.log('document db connected')).catch(err => console.error(err));

UserModel.findOne({email:'alan@infinov.com'}).then(user => {
    if (!user) {
        return UserModel.create({
            name: 'Alan Anderson',
            email: 'alan@infinov.com',
            nickName: 'alanracer',
            accountType: 'admin',
            password: 'testadmin'
        });
    }
    else
        return;
});

UserModel.findOne({ email: 'alanpurple@gmail.com'}).then(user => {
    if (!user) {
        return UserModel.create({
            name: 'Alan User',
            email: 'alanpurple@gmail.com',
            nickName: 'retriever',
            accountType: 'user',
            password: 'testuser'
        });
    }
    else
        return;
});

const rootPath = path.join(__dirname, '../wwwroot');

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
if (app.get("env") == "production") {
    const accessLogStream = createWriteStream(__dirname + '/logs/' + "access.log", {flags: 'a'});
    app.use(logger("[:date[clf]] :method :url :status :response-time ms", {stream: accessLogStream}));
} else {
    app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get(['/', '/data-manager/?', '/login/?', '/signup/?', '/admin/?', '/info',
    '/description/?', '/model-suggestion/?', '/train-manager/?', '/eda-manager/?',
    '/association', '/user-info'],
    (req, res) => res.sendFile(path.join(rootPath, 'index.html')));

app.use(express.static(rootPath, { index: false }));

app.use('/data', DataRoute);
app.use('/eda', EdaRoute);
app.use('/eda-text', EdaTextRoute);
app.use('/eda-vision', EdaVisionRoute);
app.use('/account', AccountRoute);
app.use('/lr', LrRoute);
app.use('/project', ProjectRoute);

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {explorer: true}));

// error handlers

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(err[ 'status' ] || 500);
        res.send({
            message: err.message
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || 500);
    res.send({
        message: err.message
    });
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function () {
    debug(`Express server listening on port ${(server.address() as AddressInfo).port}`);
});