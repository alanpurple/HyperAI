import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local';
//import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
//import { Strategy as FacebookStrategy } from 'passport-facebook';

import { UserModel } from './models/user';

passport.serializeUser((user, done) => done(null, user['email']));

passport.deserializeUser(function (em, done) {
    UserModel.findOne({ where: { email: em } }).then(user => {
        done(null, user);
    }).catch(err => done(err));
});

passport.use(new LocalStrategy(
    function (emailAddr, password, done) {
        UserModel.findOne({ where: { email: emailAddr } }).then(user => {
            if (!user) {
                UserModel.create({
                    email: emailAddr,
                    password: password,
                    accountType: 'local'
                }).then(user => done(null, user));
            }
            else
                user.comparePassword(password, done);
        }).catch(err => done(err));
    }
));

export default passport;