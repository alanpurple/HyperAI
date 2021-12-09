import * as express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
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
import EdaVisionRoute from './routes/dl-vision';
import AccountRoute from './routes/account';
import LrRoute from './routes/lr';
import ProjectRoute from './routes/project';
import AdminRoute from './routes/admin';

import * as swaggerUi from 'swagger-ui-express';
import * as swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from "./openapi/swagger";

import * as URI from "./uri.json"


const debug = require('debug')('my express app');
const app = express();
const socketServer = createServer(app);
const io = new Server(socketServer);



connectDdb().then(() => console.log('document db connected')).catch(err => console.error(err));

UserModel.findOne({email:'alan@infinov.com'}).then(user => {
    if (!user) {
        return UserModel.create({
            name: 'Alan Anderson',
            email: 'alan@infinov.com',
            organization:'infinov',
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
            organization:'infinov',
            nickName: 'retriever',
            accountType: 'user',
            password: 'testuser'
        });
    }
    else
        return;
});

access('../datasets').then(() => console.log('datasets directory is ok.'))
    .catch(err => {
        if (err.code == 'ENOENT')
            mkdir('../datasets').then(() => console.log('datasets directory has been created.'))
                .catch(err => console.error(err));
        else
            console.error('something\'s wrong, cannot access or create datasets directory');
    });

const rootPath = path.join(__dirname, '../wwwroot');

// no authentication for mongodb currently, need to be updated
const options = {
    mongoUrl: `mongodb://${URI.id}:${URI.password}@${URI.server}/${URI.hyperaidb}`,
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

app.use(favicon('./favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

io.on('connection', socket =>
    socket.broadcast.emit('socket connected')
);

app.get(['/', '/data-manager/?', '/login(/:id)?', '/signup(/:id)?', '/admin-console/?', '/info',
    '/description/?', '/model-suggestion/?', '/train-manager/?', '/eda-manager/?','/notfound',
    '/association', '/user-info','/project-manager(/:name)?','/project-manager/:name/auto','/privacy-policy'],
    (req, res) => {
        res.sendFile(path.join(rootPath, 'index.html'));
        if (req.isAuthenticated()){
            //TODO: retrieve runningTasks list from mlserver and compare with db data
            // io.emit( blahblah )
        }
    });

app.use(express.static(rootPath, { index: false }));

app.use('/data', DataRoute);
app.use('/eda', EdaRoute);
app.use('/eda-text', EdaTextRoute);
app.use('/eda-vision', EdaVisionRoute);
app.use('/account', AccountRoute);
app.use('/lr', LrRoute);
app.use('/project', ProjectRoute);
app.use('/admin', AdminRoute);

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {explorer: true}));

// error handlers

// catch 404 and forward to error handler
app.use((req, res) => {
    res.redirect('/notfound');
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

const server = socketServer.listen(app.get('port'), () =>
    debug(`Express server listening on port ${(server.address() as AddressInfo).port}`)
);