import { Schema, model } from 'mongoose';

interface DataInfo {
    name: string;
    type: 'structural' | 'sound' | 'text' | 'image';
    numRows: number;
    owner: number;
}

const schema = new Schema<DataInfo>({
    name: { type: String, required: true, unique:true },
    type: { type: String, enum: ['structural', 'sound', 'text', 'image'] },
    numRows: { type: Number, required: true },
    // default for open data, id 0 for admin
    owner: { type: Number, ref: 'User', required: true, default:0 }
});

export const DataInfoModel = model<DataInfo>('DataInfo', schema);