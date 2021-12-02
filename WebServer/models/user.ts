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
    name: { type: String, required: true },
    password: { type: String, required: true },
    organization: { type: String, enum: ['infinov', 'namutech', 'samsung', 'hynix'], required: true },
    nickName: { type: String, unique: true, sparse: true },
    // true for now
    hasNickName: { type: Boolean, default: true },
    accountType: { type: String, enum: ['admin', 'user'] },
    email: { type: String, unique: true, index: true, required: true },
    //To do: email verification not implemented yet, so default to true temporarily
    emailVerified: { type: Boolean,default:true },
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

schema.pre('save', { document: true, query: false }, function (next) {
    const user = this;
    if (user.isNew || user.isModified('password'))
        hash(user.password, NUM_ROUNDS, function (err, hashed) {
            if (err)
                next(err);
            else {
                user.password = hashed;
                next();
            }
        });
    else
        next();
});

schema.pre('updateOne', { document: true, query: false }, function (next) {
    let doc = this;
    if (doc.isModified('password'))
        hash(doc.password, NUM_ROUNDS, function (err, hashed) {
            if (err)
                next(err);
            else {
                doc.password = hashed;
                next();
            }
        });
});

export const UserModel = model<User>('User', schema);