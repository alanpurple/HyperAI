export interface Project {
  name: string;
  dataURI: string;
  projectType: 'single' | 'sequential' | 'multiple_comparison';
  taskType: 'various' | 'vision' | 'text' | 'structural';
  owner: string;  // self for user, email for admin
  members: [{ user: string /*email*/, role: 'attendee' | 'member' }]; // one and only owner, others are all attendee(for now)
  visionTasks: VisionTask[];  // use only when taskType is 'vision'
  textTasks: TextTask[];  // use only when taskType is 'text'
  structuralTasks: StructuralTask[];
}

export interface VisionTask {
  name: string;
  taskType: 'preprocessing' | 'segmentation' | 'classification' | 'detection';
  includeMask: boolean;
  completed: boolean;
  preprocessed: string; // preprocessed output folder, only for preprocessing task
}

export interface TextTask {
  name: string;
}

export interface StructuralTask {
  name: string;
  taskType: 'recommendation' | 'clustering' | 'classification' | 'regression';
}

export interface EditMember {
  inMember: string[];
  outMember: string[];
}
