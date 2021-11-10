import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm.dialog';
import { ErrorAlert } from './error.alert';
import { Project } from './project.data';

import { ProjectDialog } from './project.dialog';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass']
})
export class ProjectComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private projectService: ProjectService,
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog
  ) { }

  isMaking: boolean = false;
  projects: Project[] = [];
  newProject: Project = {} as Project;

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      projects => this.projects = projects,
      err => this.errorAlert.open(err)
    );
  }

  //using dialog
  createProject() {
    const dialogRef = this.dialog.open(ProjectDialog, {
      data: {
        project: {} as Project,
        isNew:true
      }
    });
    dialogRef.afterClosed().subscribe(project =>
      this.projectService.createProject(project).subscribe(
        msg => {
          this.projects.push(project);
          this.confirmDialog.open('project created successfully');
        },
        err => this.errorAlert.open(err)
      )
    );
  }

  //using stepper
  createProjectEasy() {
    this.isMaking = true;
  }

  postCreated() {
    this.projectService.createProject(this.newProject).subscribe(
      msg => {
        this.projects.push(this.newProject);
        this.newProject = {} as Project;
        this.confirmDialog.open('project created successfully');
        this.isMaking = false;
      }
    )
  }

  //only dialog
  editProject(index: number) {
    const currentProject = this.projects[index];
    const dialogRef = this.dialog.open(ProjectDialog, {
      data: {
        project: currentProject,
        isNew: false
      }
    });
    dialogRef.afterClosed().subscribe(project => {
      let inMember: { user: string, role: 'attendee' | 'member' }[] = [];
      let outMember: string[] = [];
      const edited = project as Project;
      edited.members.forEach(elem => {
        if (!currentProject.members.find(elem2 => elem2.user == elem.user))
          inMember.push(elem);
      });
      currentProject.members.forEach(elem => {
        if (!edited.members.find(elem2 => elem2.user == elem.user))
          outMember.push(elem.user);
      });
      // currently only members can be edited in existing project info management
      this.projectService.editProjectMembers(currentProject.name, {
        inMember: inMember, outMember: outMember
      })
    })
  }
}
