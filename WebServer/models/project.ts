import { Schema, model, Types } from 'mongoose';

export interface Project {
    name: string;
    projectType: 'single' | 'multiple' | 'multiple_comparison';
    members: { user: Types.ObjectId, role: 'owner' | 'attendee' | 'member' };
}

const schema = new Schema<Project>({
    name: String,
    projectType: { type: String, enum: ['single', 'multiple', 'multiple_comparison'] },
    members: {
        type: {
            user: { type: 'ObjectId', ref: 'User' }, role: { type: String, enum: ['owner', 'attendee', 'member'] }
        }
    }
});

export const ProjectModel = model<Project>('Project', schema);