import { Schema, model, Types } from 'mongoose';

export interface Project {
    name: string;
    projectType: 'single' | 'sequential' | 'multiple_comparison';
    taskType: 'various' | 'vision' | 'text' | 'structural';
    members: [{ user: Types.ObjectId, role: 'owner' | 'attendee' | 'member' }]; // one and only owner, others are all attendee(for now)
    visionTasks: VisionTask[];
    textTasks: TextTask[];
}

const schema = new Schema<Project>({
    name: { type: String, required: true, unique: true },
    projectType: { type: String, enum: ['single', 'sequential', 'multiple_comparison'], required: true },
    taskType: { type: String, enum: ['varios', 'vision', 'text', 'structural'] },
    members: {
        type: [{
            user: { type: 'ObjectId', ref: 'User', required: true }, role: { type: String, enum: ['owner', 'attendee', 'member'], required: true },  _id: false
        }]
    }
});

export interface VisionTask {
    name: string;
    taskType: 'preprocessing' | 'segmentation' | 'classification' | 'detection';
    includeMask: boolean;
}

export interface TextTask {
    name: string;
}

const VisionTaskSchema = new Schema<VisionTask>({
    name: String,
    taskType: { type: String, enum: ['preprocessing', 'segmentation', 'classification', 'detection'] },
    includeMask: Boolean
});

const TextTaskSchema = new Schema<TextTask>({
    name: String
});

export const ProjectModel = model<Project>('Project', schema);