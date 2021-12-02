import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AdminService } from './admin.service';
import { Project } from './project.data';
import { ProjectDialog } from './project.dialog';
import { ProjectService } from './project.service';
import { ConfirmDialog } from './shared/confirm.dialog';
import { DeleteConfirmDialog } from './shared/delete.confirm.dialog';
import { ErrorAlert } from './shared/error.alert';
import { UserData } from './user.data';
import { UserDialog } from './user.dialog';
import { UserService } from './user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.console.html',
  styleUrls: ['./admin.console.sass']
})
export class AdminConsole implements OnInit, AfterViewInit {

  constructor(
    private projectService: ProjectService,
    private adminService: AdminService,
    private userService: UserService,
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
  organizations: string[] = [];

  userColumns = ['email', 'name', 'organization', 'nickName','edit','delete'];
  projectColumns = ['name', 'owner', 'dataURI', 'projectType', 'category', 'objective','edit','delete'];
  isSmallDevice = false;

  userDS = new MatTableDataSource([] as UserData[]);
  projectDS = new MatTableDataSource([] as Project[]);
  @ViewChild('userSort') userSort: MatSort | null = null;
  @ViewChild('projectSort') projectSort: MatSort | null = null;

  categories = ['various', 'vision', 'text', 'structural'];
  objectives = ['classification', 'regression',
    // only for text
    'qna', 'translation',
    // only for vision
    'segmentation', 'object detection',
    'clustering', 'anomaly detection', 'recommendation'];

  ngAfterViewInit() {
    this.userDS.sort = this.userSort;
    this.projectDS.sort = this.projectSort;
  }

  ngOnInit(): void {
    this.adminService.getUsers().subscribe(
      users => {
        this.users = users;
        this.userDS.data = this.users;
      },
      err => this.errorAlert.open(err.error)
    );
    this.projectService.getProjects().subscribe(
      projects => {
        this.projects = projects;
        this.projectDS.data = this.projects;
      },
      err => this.errorAlert.open(err.error)
    );
    this.userService.getOrganizations().subscribe(
      orgs => this.organizations = orgs,
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
    this.dialog.open(UserDialog, {
      data: {
        user: new UserData(), isNew: true,
        organizations: this.organizations
      }
    }).afterClosed()
      .subscribe(data => {
        if (data) {
          this.adminService.createUser(data.data,data.password).subscribe(
            msg => {
              this.users.push(data.data);
              this.userDS.data = this.users;
              this.confirmDialog.open('user created');
            }, err => this.errorAlert.open(err.error)
          );
        }
      });
  }

  createProject() {
    this.dialog.open(ProjectDialog, {
      data: {
        project: {} as Project, isNew: true,
        isAdmin: true, users: this.users.map(elem => elem.email)
      }
    }).afterClosed().subscribe(project => {
      if (project)
        this.projectService.createProject(project).subscribe(
          msg => {
            this.projects.push(project);
            this.projectDS.data = this.projects;
            this.confirmDialog.open('project created');
          });
    });
  }

  editUser(email: string) {
    const index = this.users.findIndex(elem => elem.email == email);
    if (index < 0) {
      this.errorAlert.open('cannot edit null user');
      return;
    }
    const currentUser = this.users[index];
    this.dialog.open(UserDialog, { data: { user: currentUser, isNew: false } })
      .afterClosed().subscribe(
        user => {
          if (user) {
            if (user.name != currentUser.name) {
              this.adminService.editUser(email, { name: user.name }).subscribe(
                msg => {
                  this.users[index].name = user.name;
                  this.userDS.data = this.users;
                  this.confirmDialog.open('user edited');
                }, err => this.errorAlert.open(err.error));
            }
            else
              this.confirmDialog.open('nothings changed');
          }
        });
  }

  deleteUser(email: string) {
    const index = this.users.findIndex(elem => elem.email == email);
    if (index < 0) {
      this.errorAlert.open('cannot delete null user');
      return;
    }
    this.dialog.open(DeleteConfirmDialog).afterClosed().subscribe(
      selection => {
        if (selection)
          this.adminService.deleteUser(email).subscribe(
            msg => {
              this.users.splice(index, 1);
              this.userDS.data = this.users;
              this.confirmDialog.open('user deleted');
            }
          )
      });
  }

  editProject(name: string) {
    const index = this.projects.findIndex(elem => elem.name == name);
    if (index < 0) {
      this.errorAlert.open('cannot edit null project');
      return;
    }
    const currentProject = this.projects[index];
    const projectMembers = currentProject.members.map(elem => elem.user);
    this.adminService.getColleagues(currentProject.owner).subscribe(
      colleagues => {
        this.dialog.open(ProjectDialog, {
          data: {
            project: currentProject, isNew: false, isAdmin: true,
            categories: this.categories,
            objectives: this.objectives,
            colleagues: colleagues,
            availableMembers: colleagues.filter(elem => !projectMembers.includes(elem))
          }
        }).afterClosed().subscribe(
          project => {
            if (project) {
              let inMember: { user: string, role: 'attendee' | 'member' }[] = [];
              let outMember: string[] = [];
              const edited = project as Project;
              edited.members.forEach(elem => {
                if (!projectMembers.find(elem2 => elem2 == elem.user))
                  inMember.push(elem);
              });
              projectMembers.forEach(elem => {
                if (!edited.members.find(elem2 => elem2.user == elem))
                  outMember.push(elem);
              });
              if (inMember.length < 1 && outMember.length < 1)
                this.confirmDialog.open('nothing\'s changed');
            }
          }
        );
      }, err => this.errorAlert.open(err.error)
    );
  }

  deleteProject(name: string) {
    const index = this.projects.findIndex(elem => elem.name == name);
    if (index < 0) {
      this.errorAlert.open('cannot delete null project');
      return;
    }
    this.dialog.open(DeleteConfirmDialog).afterClosed().subscribe(
      selection => {
        if (selection)
          this.projectService.deleteProject(name).subscribe(
            msg => {
              this.projects.splice(index, 1);
              this.projectDS.data = this.projects;
              this.confirmDialog.open('project deleted');
            })
      }
    );
  }

}
