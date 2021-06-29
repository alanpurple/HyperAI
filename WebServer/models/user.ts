import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { DataTypes } from 'sequelize';

const NUM_ROUNDS = 10;

interface User {
    id: number,
    name: string;
    nickName: string;
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
    id: { type: Number, required: true },
    name: { type: String, required: true },
    nickName: { type: String },
    accountType: { type: DataTypes.ENUM,values:['admin','user'] },
    email: { type: String, required: true },
    data: { type: [String], default: [] },
    cleanData: { type: [String], default: [] },
    cleasedData: { type: [String], default: [] },
    preprocessedData: { type: [String], default: [] },

    comparePassword(password: string, callback: any) {
        const user = this;
        compare(password, this.password, function (err, result) {
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
});

schema.post('save', doc =>
    hash(doc.password, NUM_ROUNDS, (err, hashed) => {
        if (err)
            throw err;
        else
            doc.update({ password: hashed });
    })
);

schema.post('update', doc => {
    if (doc.changed('password'))
        hash(doc.password, NUM_ROUNDS, (err, hashed) => {
            if (err)
                throw err;
            else
                doc.password = hashed;
        });
});

export const UserModel = model<User>('User', schema);