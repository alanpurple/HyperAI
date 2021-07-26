import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local';
import { Request } from 'express';
//import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
//import { Strategy as FacebookStrategy } from 'passport-facebook';

import { UserModel } from './models/user';

passport.serializeUser((user, done) => done(null, user['email']));

passport.deserializeUser(function (em, done) {
    UserModel.findOne({ email: em }).then(user => {
        done(null, user);
    }).catch(err => done(err));
});

passport.use(new LocalStrategy({ passReqToCallback: true },
    function (req: Request, emailAddr: string, password: string, done) {
        UserModel.findOne({ email: emailAddr }).then(user => {
            if (!user) {
                UserModel.create({
                    email: emailAddr,
                    password: password,
                    name: req.body.name,
                    accountType: 'user'
                }).then(user => done(null, user));
            }
            else
                user.comparePassword(password, done);
        }).catch(err => done(err));
    }
));

export default passport;