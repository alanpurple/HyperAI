import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as FacebookStrategy } from 'passport-facebook';

import { UserModel } from './models/user';

passport.serializeUser((user, done) => done(null, user['email']));