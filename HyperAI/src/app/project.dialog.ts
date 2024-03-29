import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { Project } from "./project.data";
import { NameRe } from './shared/validataions';
import { DataInfo } from './data.info';
import { DataService } from "./data.service";
import { UserService } from "./user.service";
import { ErrorAlert } from "./shared/error.alert";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { NgIf, NgFor } from "@angular/common";
import { ForbiddenValidatorDirective } from "./shared/forbidden-name.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FlexModule } from "@angular/flex-layout/flex";
import { FormsModule } from "@angular/forms";
import { ExtendedModule } from "@angular/flex-layout/extended";

@Component({
    selector: 'project-dialog',
    templateUrl: './project.dialog.html',
    standalone: true,
    imports: [MatDialogModule, ExtendedModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, ForbiddenValidatorDirective, NgIf, MatSelectModule, NgFor, MatOptionModule, MatChipsModule, MatIconModule, MatButtonModule]
})
export class ProjectDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      project: Project, isNew: boolean, availableMembers: string[], userData: DataInfo[],
      dataList: DataInfo[], categories: string[], objectives: string[], isAdmin: boolean,
      //only for admin
      users: string[]
    },
    private userService: UserService,
    private dataService: DataService,
    public dialogRef: MatDialogRef<ProjectDialog>,
    private errorAlert: ErrorAlert
  ) {
    this.originalAM == this.data.availableMembers;
    if (!this.data.isNew)
      this.originalData = JSON.parse(JSON.stringify(this.data.project));
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

  onUserChange() {
    this.dataService.getDataPublic().subscribe({
      next: data => {
        this.data.userData = data;
        this.userService.getUser().subscribe({
          next: user => {
            this.data.userData = this.data.userData.concat(user.data);
            this.filterData();
          },
          error: err => {
            this.errorAlert.open(err.error);
            this.dialogRef.close();
          }
        });
      }, error: err => {
        this.errorAlert.open(err.error);
        this.dialogRef.close();
      }
    });
  }

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

  reset() {
    this.data.project = this.originalData;
    this.data.availableMembers = this.originalAM;
  }

  isValidObjective(objective: string) {
    if (['qna', 'translation'].includes(objective) && this.data.project.category != 'text')
      return false;
    if (['segmentation', 'object detection'].includes(objective) && this.data.project.category != 'vision')
      return false;
    return true;
  }
}
