import { Schema, model } from 'mongoose';

interface User {
    id: number,
    name: string;
    nickName: string;
    email: string;
    data: string[];
}

const schema = new Schema<User>({
    id: { type: Number, required:true },
    name: { type: String, required: true },
    nickName: { type: String },
    email: { type: String, required: true },
    data: { type: [String] }
});

export const UserModel = model<User>('User', schema);