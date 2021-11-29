export interface Project {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  dataURI: string;
  projectType: 'single' | 'sequential' | 'multiple_comparison';
  category: 'vision' | 'text' | 'structural' | 'various';
  objective: 'classification' | 'regression' |
              // only for text
              'qna' |
              // only for vision
              'segmentation' | 'object detection' |
              'clustering' | 'anomaly detection' | 'translation' | 'recommendation';
  owner: string;  // self for user, email for admin
  members: { user: string /*email*/, role: 'attendee' | 'member' }[]; // one and only owner, others are all attendee(for now)
  visionTasks: VisionTask[];  // use only when taskType is 'vision'
  textTasks: TextTask[];  // use only when taskType is 'text'
  structuralTasks: StructuralTask[];
}

export interface VisionTask {
  name: string;
  description: string;
  taskType: 'preprocess' | 'train' | 'test' | 'deploy';
  completed: boolean;
  preprocessed: string; // preprocessed output folder, only for preprocessing task

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
   * optins for segmentation
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
  desciption: string;
  taskType: 'tokenization' | 'vectorization' | 'train' | 'test' | 'deploy'
}

export interface StructuralTask {
  name: string;
  description: string;
  taskType: 'preprocess' | 'train' | 'test' | 'deploy';
}

export interface EditMember {
  inMember: { user: string, role: 'attendee' | 'member'}[];
  outMember: string[];
}
