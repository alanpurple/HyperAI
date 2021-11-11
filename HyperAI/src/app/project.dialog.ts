import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Project } from "./project.data";


@Component({
  selector: 'project-dialog',
  templateUrl: './project.dialog.html'
})
export class ProjectDialog {
  constructor(
    public dialogRef: MatDialogRef<ProjectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project, isNew: boolean }
  ) {
    this.originalData = this.data.project;
  }

  originalData: Project = {} as Project;

  cancel() {
    this.dialogRef.close();
  }

  reset() {
    this.data.project = this.originalData;
  }
}
