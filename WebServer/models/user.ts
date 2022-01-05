import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

import { DataInfo, DataSchema } from './data.info';

const NUM_ROUNDS = 10;

interface RunningTasks {
    project: string,
    taskType: 'vision' | 'text' | 'structural',
    taskName: string
}

export interface User {
    name: string;
    password: string;
    organization: 'infinov' | 'namutech' | 'samsung'|'hynix';
    nickName: string;
    hasNickName: boolean;
    accountType: 'admin' | 'user';
    email: string;
    emailVerified: boolean;
    data: DataInfo[];
    comparePassword(password: string, callback: any);
    runningTasks: RunningTasks[];
}

const runningTaskSchema = new Schema<RunningTasks>({
    project: String,
    taskType: { type: String, enum: ['vision', 'text', 'structural'] },
    taskName: String
}, { _id: false });

const schema = new Schema<User>({
    name: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    organization: { type: String, enum: ['infinov', 'namutech', 'samsung', 'hynix'], required: true },
    nickName: { type: String, unique: true, sparse: true, trim: true },
    // true for now
    hasNickName: { type: Boolean, default: true },
    accountType: { type: String, enum: ['admin', 'user'], default: 'user' },
    email: { type: String, unique: true, index: true, required: true },
    //To do: email verification not implemented yet, so default to true temporarily
    emailVerified: { type: Boolean, default: true },
    data: [DataSchema],
    runningTasks: [runningTaskSchema]
});

schema.methods.comparePassword = function(password: string, callback: any){
    const user = this;
    compare(password, user.password, function (err, result) {
        if (err) {
            console.error(err);
            callback(null, false);
        }
        else if (!result)
            callback(null, false);
        else
            callback(null, user);
    });
}

schema.pre('save', function (next) {
    const user = this;
    if ((user.isModified('data')&&user.get('data').length>1)||(user.isNew&&user.get('data').length>1)) {
        const dataNames = user.get('data').map(elem => elem.name);
        if ((new Set(dataNames)).size != dataNames.length) {
            next(Error('duplicate data names!'));
            return;
        }
    }
    if (user.isNew || user.isModified('password'))
        hash(user.get('password'), NUM_ROUNDS, function (err, hashed) {
            if (err)
                next(err);
            else {
                user.set('password', hashed);
                next();
            }
        });
    else
        next();
});

schema.pre('updateOne', function (next) {
    let doc = this;
    if (doc.isModified('data')&&doc.get('data').length>1) {
        const dataNames = doc.get('data').map(elem => elem.name);
        if ((new Set(dataNames)).size != dataNames.length) {
            next(Error('duplicate data names!'));
            return;
        }
    }
    if (doc.isModified('password'))
        hash(doc.get('password'), NUM_ROUNDS, function (err, hashed) {
            if (err)
                next(err);
            else {
                doc.set('password', hashed);
                next();
            }
        });
    else
        next();
});

export const UserModel = model<User>('User', schema);