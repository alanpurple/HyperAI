import { Schema } from 'mongoose';

export interface DataInfo {
    name: string;   // local folder name for local type, URI upmost name(collection name, etc) elsewhere
    uri: string;    // actual uri
    createdAt: Date;
    locationType: 'db uri' | 'local' | 'smb' | 'datalake' | 'aws s3';
    type: 'structural' | 'sound' | 'text' | 'vision';
    numRows: number;
    isClean: boolean;
    cleansed: DataBasic;
    preprocessed: DataBasic;
}

export interface DataBasic {
    name: string;
    createdAt: Date;
    numRows: number;
    type: 'structural' | 'sound' | 'text' | 'vision';
}

const BasicSchema = new Schema<DataBasic>({
    name: { type: String, unique: true, required: true },
    createdAt: Date,
    numRows: { type: Number, required: true }
}, { _id: false, autoIndex: false, timestamps: true });

export const DataSchema = new Schema<DataInfo>({
    name: { type: String, unique: true, required: true },
    uri: { type: String, required: true },
    locationType: { type: String, enum: ['db uri', 'local', 'smb', 'datalake', 'aws s3'], required: true },
    createdAt: Date,
    type: { type: String, enum: ['structural', 'sound', 'text', 'vision'], required: true },
    numRows: { type: Number, required: true },
    isClean: Boolean,
    cleansed: BasicSchema,
    preprocessed: BasicSchema
}, { _id: false, autoIndex: false, timestamps: true });