import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

interface User {
    id: number,
    name: string;
    nickName: string;
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

export const UserModel = model<User>('User', schema);