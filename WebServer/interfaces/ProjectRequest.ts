import { StructuralTask, TextTask, VisionTask } from "../models/project";

export interface RequestProject {
  name: string;
  dataURI: string;
  projectType: 'single' | 'sequential' | 'multiple_comparison';
  category: 'various' | 'vision' | 'text' | 'structural';
  owner: string;  // self for user, email for admin
  members: { user: string /*email*/, role: 'attendee' | 'member' }[]; // one and only owner, others are all attendee(for now)
  visionTasks: VisionTask[];  // use only when taskType is 'vision'
  textTasks: TextTask[];  // use only when taskType is 'text'
  structuralTasks: StructuralTask[];
}