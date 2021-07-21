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
    nickName: { type: String },
    hasNickName: { type: Boolean, default: false },
    accountType: { type: String, enum: ['admin', 'user'] },
    email: { type: String, required: true },
    data: { type: [String], default: [] },
    cleanData: { type: [String], default: [] },
    cleasedData: { type: [String], default: [] },
    preprocessedData: { type: [String], default: [] },
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

schema.post('save', doc =>
    hash(doc.password, NUM_ROUNDS, function (err, hashed) {
        if (err)
            throw err;
        else
            doc.update({ password: hashed });
    })
);

schema.post('update', doc => {
    if (doc.changed('password'))
        hash(doc.password, NUM_ROUNDS, function (err, hashed) {
            if (err)
                throw err;
            else
                doc.password = hashed;
        });
});

export const UserModel = model<User>('User', schema);