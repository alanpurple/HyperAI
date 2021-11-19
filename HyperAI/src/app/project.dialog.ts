import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Project } from "./project.data";
import { NameRe } from './shared/validataions';

@Component({
  selector: 'project-dialog',
  templateUrl: './project.dialog.html'
})
export class ProjectDialog {
  constructor(
    public dialogRef: MatDialogRef<ProjectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      project: Project, isNew: boolean, availableMembers: string[]
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
    owner: '',
    members: [],
    visionTasks: [],
    textTasks: [],
    structuralTasks: []
  };

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
}
