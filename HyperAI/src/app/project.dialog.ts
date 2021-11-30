import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Project } from "./project.data";
import { NameRe } from './shared/validataions';
import { DataInfo } from './data.info';

@Component({
  selector: 'project-dialog',
  templateUrl: './project.dialog.html'
})
export class ProjectDialog {
  constructor(
    public dialogRef: MatDialogRef<ProjectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      project: Project, isNew: boolean, availableMembers: string[], userData: DataInfo[],
      dataList: DataInfo[], categories: string[],objectives:string[]
    }
  ) {
    this.originalAM == this.data.availableMembers;
    if(!this.data.isNew)
      this.originalData = this.data.project;
  }

  originalAM: string[] = [];
  nameRe = NameRe;

  originalData: Project = {
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    dataURI: '',
    projectType: 'single',
    category: 'structural',
    objective: 'classification',
    owner: 'self',
    members: [],
    visionTasks: [],
    textTasks: [],
    structuralTasks: []
  };

  filterData() {
    const category = this.data.project.category;
    this.data.dataList = this.data.userData.filter(elem => elem.type == category);
  }

  addMember(index: number) {
    this.data.project.members.push({ user: this.data.availableMembers[index], role: 'attendee' });
    this.data.availableMembers.splice(index, 1);
  }

  removeMember(index: number) {
    this.data.availableMembers.push(this.data.project.members[index].user);
    this.data.project.members.splice(index, 1);
  }

  cancel() {
    this.dialogRef.close();
  }

  reset() {
    this.data.project = this.originalData;
    this.data.availableMembers = this.originalAM;
  }

  isValidObjective(objective: string) {
    if (['qna', 'translation'].includes(objective) && this.data.project.category != 'text')
      return true;
    if (['segmentation', 'object detection'].includes(objective) && this.data.project.category != 'vision')
      return true;
    return false;
  }
}
