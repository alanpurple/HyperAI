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
      Array.prototype.push.apply(this.projectColumns,['createdAt','updatedAt'])
  }

  users: UserData[] = [];
  projects: Project[] = [];

  userColumns = ['email', 'name', 'organization', 'nickName'];
  projectColumns = ['name', 'owner', 'dataURI', 'projectType', 'category', 'objective'];
  isSmallDevice = false;

  @ViewChild('projectTable') projectTable: MatTable<Project> | null = null;
  @ViewChild('userTable') userTable: MatTable<UserData> | null = null;

  ngOnInit(): void {
    this.adminService.getUsers().subscribe(
      users => this.users = users,
      err => this.errorAlert.open(err.error)
    );
    this.projectService.getProjects().subscribe(
      projects => this.projects = projects,
      err => this.errorAlert.open(err.error)
    );
  }

  createUser() {

  }

  editUser(index:number) {

  }

  deleteUser(index: number) {

  }

  editProject(index: number) {

  }

  deleteProject(index: number) {

  }

}
