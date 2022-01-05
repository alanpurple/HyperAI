import { Schema, model, Types } from 'mongoose';
import { UserModel } from './user';

export interface Project {
    name: string;
    dataURI: string;
    projectType: 'single' | 'sequential' | 'multiple_comparison';
    category: 'various' | 'vision' | 'text' | 'structural';
    objective: 'classification' | 'regression' |
                // only for text
                'qna' | 'translation' |
                // only for vision
                'segmentation' | 'object detection' |
                'clustering' | 'anomaly detection' |  'recommendation';
    owner: Types.ObjectId;
    members: Member[]; // one and only owner, others are all attendee(for now)
    visionTasks: VisionTask[];  // use only when category is 'vision'
    textTasks: TextTask[];  // use only when category is 'text'
    structuralTasks: StructuralTask[];
}

export interface Member {
    user: Types.ObjectId;
    role: 'attendee' | 'member'
}

const VisionTaskSchema = new Schema<VisionTask>({
    name: String,
    description: String,
    taskType: { type: String, enum: ['preprocess', 'train', 'test', 'deploy'], required: true },
    completed: Boolean,
    //preprocessed output is len 3 of [train,val,test] or len 2 of [train,test]
    preprocessed: [String], // output folder, only for preprocessing task

    /**
   * options for preprocessing
   * */
    include_mask: Boolean,
    train_dir: String,
    val_dir: String,
    test_dir: String,
    train_anno: String,
    val_anno: String,

    /**
     * optins for segmentation
     * */
    batch_size: Number,
    no_xla: Boolean,
    use_amp: Boolean,

    // currently only one type(R-CNN) param set is available
    model_params: {
        type: {
            min_level: Number,
            max_level: Number,
            skip_crowd: Boolean,
            use_category: Boolean,
            augment_input_data: Boolean
        }
    },
    tb_port: Number
}, { _id: false });

const TextTaskSchema = new Schema<TextTask>({
    name: String,
    description: String,
    taskType: { type: String, enum: ['tokenization', 'vectorization', 'train', 'test', 'deploy'] }
}, { _id: false });

const StructuralTaskSchema = new Schema<StructuralTask>({
    name: String,
    description: String,
    taskType: { type: String, enum: ['preprocess', 'train', 'test', 'deploy'], required: true }
}, { _id: false });

const MemberSchema = new Schema<Member>({
    user: { type: 'ObjectId', ref: 'User', required: true },
    role: { type: String, enum: ['attendee', 'member'] }
}, { _id: false, autoIndex: false });

const schema = new Schema<Project>({
    name: { type: String,unique:true, required: true },
    dataURI: { type: String, required:true },
    projectType: { type: String, enum: ['single', 'sequential', 'multiple_comparison'] },
    category: { type: String, enum: ['various', 'vision', 'text', 'structural'] },
    objective: {
        type: String, enum: [
            'classification', 'segmentation', 'regression', 'qna','translation', 'object detection',
            'clustering', 'anomaly detection', 'recommendation']
    },
    owner: { type: 'ObjectId', ref: 'User', required: true },
    members: [MemberSchema],
    visionTasks: {
        type: [VisionTaskSchema],
        validate: {
            validator: function (tasks) {
                return !(tasks?.length) || this.category == 'vision' || this.category == 'various';
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
                return !(tasks?.length) || this.category == 'text' || this.category == 'various';
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
                return !(tasks?.length) || this.category == 'structural' || this.category == 'various';
            }
        },
        required: function () {
            return this.projectType == 'structural';
        }
    }
}, { timestamps:true });

schema.pre('save', async function (next) {
    const project = this;
    if (project.isNew) {
        const user = await UserModel.findById(project.get('owner'),'data');
        const admins = await UserModel.find({ accountType: 'admin' }, 'data');
        const userData = user.data.map(elem => elem.name);
        const adminData = admins.flatMap(admin => admin.data).map(elem => elem.name);
        if (!userData.includes(project.get('dataURI')) && !adminData.includes(project.get('dataURI')))
            next(Error('dataURI is not included in user data list'));
    }
    if ((project.isNew || project.isModified('visionTasks')) && project.get('visionTasks').length > 1)
        if ((new Set(project.get('visionTasks'))).size != project.get('visionTasks').length)
            next(Error('duplicate task names'));
    if ((project.isNew || project.isModified('textTasks')) && project.get('textTasks').length > 1)
        if ((new Set(project.get('textTasks'))).size != project.get('textTasks').length)
            next(Error('duplicate task names'));
    if ((project.isNew || project.isModified('structuralTasks')) && project.get('structuralTasks').length > 1)
        if ((new Set(project.get('structuralTasks'))).size != project.get('structuralTasks').length)
            next(Error('duplicate task names'));
    next();
});

schema.pre('updateOne', function (next) {
    const project = this;
    if (project.isModified('visionTasks') && project.get('visionTasks').length > 1)
        if ((new Set(project.get('visionTasks'))).size != project.get('visionTasks').length)
            next(Error('duplicate task names'));
    if (project.isModified('textTasks') && project.get('textTasks').length > 1)
        if ((new Set(project.get('textTasks'))).size != project.get('textTasks').length)
            next(Error('duplicate task names'));
    if (project.isModified('structuralTasks') && project.get('structuralTasks').length > 1)
        if ((new Set(project.get('structuralTasks'))).size != project.get('structuralTasks').length)
            next(Error('duplicate task names'));
    next();
});

export interface VisionTask {
    name: string;
    description: string;
    taskType: 'preprocess' | 'train' | 'test' | 'deploy';
    completed: boolean;
    // usually train,val,test, or train, test
    preprocessed: string[]; // preprocessed output folder, only for preprocessing task

    /**
   * options for preprocessing
   * */
    include_mask: boolean | undefined;
    train_dir: string | undefined;
    val_dir: string | undefined;
    test_dir: string | undefined;
    train_anno: string | undefined;
    val_anno: string | undefined;

    /**
     * optins for segmentation train
     * */
    batch_size: number | undefined;
    no_xla: boolean | undefined;
    use_amp: boolean | undefined;
    // currently only one type(R-CNN) param set is available
    model_params: VisionModelParams | null;
    tb_port: number | undefined;
}

// temporary, currently for Masked R-CNN
export interface VisionModelParams {
    min_level: number;
    max_level: number;
    skip_crowd: boolean;
    use_category: boolean;
    augment_input_data: boolean;
}

export interface TextTask {
    name: string;
    description: string;
    taskType: 'tokenization' | 'vectorization' | 'train' | 'test' | 'deploy';
}

export interface StructuralTask {
    name: string;
    description: string;
    taskType: 'preprocess' | 'train' | 'test' | 'deploy';
}

export const ProjectModel = model<Project>('Project', schema);