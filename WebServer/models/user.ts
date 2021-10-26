import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

import { DataInfo, DataSchema } from './data.info';

const NUM_ROUNDS = 10;

export interface User {
    name: string;
    password: string;
    nickName: string;
    hasNickName: boolean;
    accountType: 'admin' | 'user';
    email: string;
    data: DataInfo[];
    comparePassword(password: string, callback: any);
}

const schema = new Schema<User>({
    name: { type: String, required: true },
    password: { type: String, required: true },
    // temporary default nickname
    nickName: { type: String, unique: true, sparse: true },
    // true for now
    hasNickName: { type: Boolean, default: true },
    accountType: { type: String, enum: ['admin', 'user'] },
    email: { type: String, unique: true, index: true, required: true },
    data: [DataSchema]
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