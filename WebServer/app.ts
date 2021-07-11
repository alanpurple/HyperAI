import * as express from 'express';
import { mkdir, stat } from 'fs/promises';
import { AddressInfo } from "net";
import * as path from 'path';
import { connectDdb } from './connect-ddb';
import favicon = require('serve-favicon');
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import { UserModel } from 'models/user';
import * as session from 'express-session';
const SqlStore = require('express-mysql-session')(session);


const debug = require('debug')('my express app');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

connectDdb().then(() => console.log('document db connected')).catch(err => console.error(err));

UserModel.findById(1).then(user => {
    if (!user) {
        return UserModel.create({
            id: 1,
            email: 'alan@infinov.com',
            emailVerified: true,
            nickName: 'alanracer',
            accountType: 'admin',
            password: 'testadmin'
        });
    }
    else
        return;
});

const rootPath = path.join(__dirname, '../HyperAI/dist/HyperAI');

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'alan1234',
    database: 'hyperai'
};

const sessionStore = new SqlStore(options);

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

app.use('/data', require('routes/data').default);
app.use('/eda', require('routes/eda').default);
app.use('/eda-text', require('routes/eda-text').default);
app.use('/eda-vision', require('routes/eda-vision').default);

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