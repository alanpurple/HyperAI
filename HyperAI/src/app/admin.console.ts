import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { AdminService } from './admin.service';
import { Project } from './project.data';
import { ProjectService } from './project.service';
import { ConfirmDialog } from './shared/confirm.dialog';
import { DeleteConfirmDialog } from './shared/delete.confirm.dialog';
import { ErrorAlert } from './shared/error.alert';
import { UserData } from './user.data';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.console.html',
  styleUrls: ['./admin.console.sass']
})
export class AdminConsole implements OnInit {

  constructor(
    private projectService: ProjectService,
    private adminService: AdminService,
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog,
    private deleteConfirm: DeleteConfirmDialog,
    public dialog: MatDialog
  ) {
    if (window.outerWidth < 1200)
      this.isSmallDevice = true;
    else
      this.projectColumns = ['name', 'owner', 'dataURI','createdAt','updatedAt',
        'projectType', 'category', 'objective', 'edit', 'delete'];
  }

  users: UserData[] = [];
  projects: Project[] = [];

  userColumns = ['email', 'name', 'organization', 'nickName','edit','delete'];
  projectColumns = ['name', 'owner', 'dataURI', 'projectType', 'category', 'objective','edit','delete'];
  isSmallDevice = false;

  @ViewChild('projectTable') projectTable: MatTable<Project> | null = null;
  @ViewChild('userTable') userTable: MatTable<UserData> | null = null;

  ngOnInit(): void {
    this.adminService.getUsers().subscribe(
      users => this.users = users,
      err => this.errorAlert.open(err.error)
    );
    this.projectService.getProjects().subscribe(
      projects => {
        this.projects = projects;
        console.dir(projects);
      },
      err => this.errorAlert.open(err.error)
    );
  }

  formatDate(date: any) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  createUser() {

  }

  createProject() {

  }

  editUser(email:string) {

  }

  deleteUser(email: string) {

  }

  editProject(name:string) {

  }

  deleteProject(name: string) {

  }

}
