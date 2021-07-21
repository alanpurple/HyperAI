import { Schema, model, Document, PopulatedDoc } from 'mongoose';
import { User } from './user';

export interface DataInfo {
    _id: string;
    type: 'structural' | 'sound' | 'text' | 'image';
    numRows: number;
    owner: PopulatedDoc<User & Document>;
}

const schema = new Schema<DataInfo>({
    _id: { type: String },
    type: { type: String, enum: ['structural', 'sound', 'text', 'image'] },
    numRows: { type: Number, required: true },
    // default for open data, id 0 for admin
    owner: { type: 'ObjectId', ref: 'User', required: true }
});

export const DataInfoModel = model<DataInfo>('DataInfo', schema);