import {Schema, model, Types} from 'mongoose';

export interface Project {
    name: string;
    projectType: 'single' | 'multiple' | 'multiple_comparison';
    members: [{ user: Types.ObjectId, role: 'owner' | 'attendee' | 'member' }];
    task: {
        taskType: 'ML' | 'Vision' | 'NLP',
        names: ['classification' | 'regression' | 'clustering' | 'object detection' | 'segmentation' | 'feature extraction' | 'QnA' | 'Translation' | 'word feature extraction']
    };
}

const schema = new Schema<Project>({
    name: { type: String, required: true, unique: true },
    projectType: {type: String, enum: ['single', 'multiple', 'multiple_comparison'], required: true},
    members: [{
        type: {
            _id: false,
            user: {type: 'ObjectId', ref: 'User', required: true},
            role: {type: String, enum: ['owner', 'attendee', 'member'], required: true}
        }
    }],
    task: {
        taskType: {type: String, enum: ['ML', 'Vision', 'MLP'], required: true},
        names: [{
            type: [String],
            enum: ['classification', 'regression', 'clustering', 'object detection', 'segmentation', 'feature extraction', 'QnA', 'Translation', 'word feature extraction'],
            required: true
        }]
    }
}, {versionKey: false});

export const ProjectModel = model<Project>('Project', schema);