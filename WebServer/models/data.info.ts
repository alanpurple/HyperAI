import { Schema } from 'mongoose';

export interface DataInfo {
    name: string;
    type: 'structural' | 'sound' | 'text' | 'image';
    numRows: number;
    isClean: boolean;
    cleansed: DataBasic;
    preprocessed: DataBasic;
}

export interface DataBasic {
    name: string;
    numRows: number;
}

const BasicSchema = new Schema<DataBasic>({
    name: { type: String, unique: true, required: true },
    numRows: { type: Number, required: true }
}, { _id: false, autoIndex: false });

export const DataSchema = new Schema<DataInfo>({
    name: { type: String, unique: true, required: true },
    type: { type: String, enum: ['structural', 'sound', 'text', 'image'] },
    numRows: { type: Number, required: true },
    isClean: Boolean,
    cleansed: BasicSchema,
    preprocessed: BasicSchema
}, { _id: false, autoIndex: false });