import { Schema, model, Types } from 'mongoose';
import { UserModel } from './user';

export interface Project {
    name: string;
    dataURI: string;
    projectType: 'single' | 'sequential' | 'multiple_comparison';
    taskType: 'various' | 'vision' | 'text' | 'structural';
    owner: Types.ObjectId;
    members: [{ user: Types.ObjectId, role: 'attendee' | 'member' }]; // one and only owner, others are all attendee(for now)
    visionTasks: VisionTask[];  // use only when taskType is 'vision'
    textTasks: TextTask[];  // use only when taskType is 'text'
    structuralTasks: StructuralTask[];
}

const VisionTaskSchema = new Schema<VisionTask>({
    name: String,
    taskType: { type: String, enum: ['preprocessing', 'segmentation', 'classification', 'detection'] },
    includeMask: Boolean
}, { _id: false });

const TextTaskSchema = new Schema<TextTask>({
    name: String
}, { _id: false });

const StructuralTaskSchema = new Schema<StructuralTask>({
    name: String,
    taskType: { type: String, enum: ['recommendation', 'clustering', 'classification', 'regression'] }
}, { _id: false });

const schema = new Schema<Project>({
    name: { type: String, required: true },
    dataURI: { type: String, required:true },
    projectType: { type: String, enum: ['single', 'sequential', 'multiple_comparison'] },
    taskType: { type: String, enum: ['various', 'vision', 'text', 'structural'] },
    owner: {type:'ObjectId',ref:'User',required:true},
    members: {
        type: [{
            user: { type: 'ObjectId', ref: 'User' }, role: { type: String, enum: ['attendee', 'member'] }
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

schema.pre('save', { document: true, query: false }, async function (next) {
    const project = this;
    if (project.isNew) {
        const user = await UserModel.findById(project.owner);
        const userData = user.data.map(elem => elem.name);
        if (!userData.includes(project.dataURI))
            next(Error('dataURI is not included in user data list'));
    }
    if ((project.isNew || project.isModified('visionTasks')) && project.visionTasks?.length > 1)
        if ((new Set(project.visionTasks)).size != project.visionTasks.length)
            next(Error('duplicate task names'));
    if ((project.isNew || project.isModified('textTasks')) && project.textTasks?.length > 1)
        if ((new Set(project.textTasks)).size != project.textTasks.length)
            next(Error('duplicate task names'));
    if ((project.isNew || project.isModified('structuralTasks')) && project.structuralTasks?.length > 1)
        if ((new Set(project.structuralTasks)).size != project.structuralTasks.length)
            next(Error('duplicate task names'));
    next();
});

schema.pre('updateOne', { document: true, query: false }, function (next) {
    const project = this;
    if (project.isModified('visionTasks') && project.visionTasks?.length > 1)
        if ((new Set(project.visionTasks)).size != project.visionTasks.length)
            next(Error('duplicate task names'));
    if (project.isModified('textTasks') && project.textTasks?.length > 1)
        if ((new Set(project.textTasks)).size != project.textTasks.length)
            next(Error('duplicate task names'));
    if (project.isModified('structuralTasks') && project.structuralTasks?.length > 1)
        if ((new Set(project.structuralTasks)).size != project.structuralTasks.length)
            next(Error('duplicate task names'));
    next();
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