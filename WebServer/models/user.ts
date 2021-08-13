import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const NUM_ROUNDS = 10;

export interface User {
    name: string;
    password: string;
    nickName: string;
    hasNickName: boolean;
    accountType: 'admin' | 'user';
    email: string;
    data: string[];
    cleanData: string[];
    // cleansed data tables have suffix '_clsd'
    cleansedData: string[];
    // clean data and cleansed data can be preprocessed
    // preprocessedData has suffix '_prpr'
    preprocessedData: string[];
    comparePassword(password: string, callback: any);
}

const schema = new Schema<User>({
    name: { type: String, required: true },
    password: { type: String, required: true },
    // temporary default nickname
    nickName: { type: String, default:'Tom'},
    // true for now
    hasNickName: { type: Boolean, default: true },
    accountType: { type: String, enum: ['admin', 'user'] },
    email: { type: String, required: true },
    data: [String],
    cleanData: [String],
    cleasedData: [String],
    preprocessedData: [String],
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
    hash(user.password, NUM_ROUNDS, function (err, hashed) {
        if (err)
            throw err;
        else {
            user.password = hashed;
            next();
        }
    })
});

schema.pre('updateOne', { document: true, query: false }, function (next) {
    let doc = this;
    if (doc.isModified('password'))
        hash(doc.password, NUM_ROUNDS, function (err, hashed) {
            if (err)
                throw err;
            else {
                doc.password = hashed;
                next();
            }
        });
});

export const UserModel = model<User>('User', schema);