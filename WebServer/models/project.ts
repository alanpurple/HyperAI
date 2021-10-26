import { Schema, model, Types } from 'mongoose';

export interface Project {
    name: string;
    projectType: 'single' | 'sequential' | 'multiple_comparison';
    taskType: 'various' | 'vision' | 'text' | 'structural';
    members: [{ user: Types.ObjectId, role: 'owner' | 'attendee' | 'member' }]; // one and only owner, others are all attendee(for now)
    visionTasks: VisionTask[];  // use only when taskType is 'vision'
    textTasks: TextTask[];  // use only when taskType is 'text'
    structuralTasks: StructuralTask[];
}

const VisionTaskSchema = new Schema<VisionTask>({
    name: String,
    taskType: { type: String, enum: ['preprocessing', 'segmentation', 'classification', 'detection'] },
    includeMask: Boolean
});

const TextTaskSchema = new Schema<TextTask>({
    name: String
});

const StructuralTaskSchema = new Schema<StructuralTask>({
    name: String,
    taskType: { type: String, enum: ['recommendation', 'clustering', 'classification', 'regression'] }
});

const schema = new Schema<Project>({
    name: String,
    projectType: { type: String, enum: ['single', 'sequential', 'multiple_comparison'] },
    taskType: { type: String, enum: ['various', 'vision', 'text', 'structural'] },
    members: {
        type: [{
            user: { type: 'ObjectId', ref: 'User' }, role: { type: String, enum: ['owner', 'attendee', 'member'] }
        }]
    },
    visionTasks: {
        type: [VisionTaskSchema],
        validate: {
            validator: function (tasks) {
                return !tasks || this.taksType == 'vision' || this.taskType == 'various';
            }
        },
        required: function () {
            return this.projectType == 'vision';
        }
    },
    textTasks: {
        type: [TextTaskSchema],
        validate: {
            validator: function (tasks) {
                return !tasks || this.taksType == 'text' || this.taskType == 'various';
            }
        },
        required: function () {
            return this.projectType == 'text';
        }
    },
    structuralTasks: {
        type: [StructuralTaskSchema],
        validate: {
            validator: function (tasks) {
                return !tasks || this.taksType == 'structural' || this.taskType == 'various';
            }
        },
        required: function () {
            return this.projectType == 'structural';
        }
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

export interface StructuralTask {
    name: string;
    taskType: 'recommendation' | 'clustering' | 'classification' | 'regression';
}

export const ProjectModel = model<Project>('Project', schema);