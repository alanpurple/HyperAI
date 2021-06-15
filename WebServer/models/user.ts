import { Schema, model } from 'mongoose';

interface User {
    name: string;
    nickName: string;
    email: string;
    data: string[];
}

const schema = new Schema<User>({
    name: { type: String, required: true },
    nickName: { type: String },
    email: { type: String, required: true },
    data: { type: [String] }
});