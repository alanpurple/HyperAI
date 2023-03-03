import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

  userColumns = ['email', 'name', 'organization','accountType', 'nickName','edit','delete'];
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
    this.adminService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.userDS.data = this.users;
      },
      error: err => this.errorAlert.open(err.error)
    });
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.projects = projects;
        this.projectDS.data = this.projects;
      },
      error: err => this.errorAlert.open(err.error)
    });
    this.userService.getOrganizations().subscribe({
      next: orgs => this.organizations = orgs,
      error: err => this.errorAlert.open(err.error)
    });
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
          this.adminService.createUser(data.data, data.password).subscribe({
            next: msg => {
              this.users.push(data.data);
              this.userDS.data = this.users;
              this.confirmDialog.open('user created');
            }, error: err => this.errorAlert.open(err.error)
          });
        }
      });
  }

  createProject() {
    this.dialog.open(ProjectDialog, {
      data: {
        project: {
          name: '',
          dataURI: '',
          projectType: 'single',
          category: 'structural',
          owner: 'self',
          members: [],
          visionTasks: [],
          textTasks: [],
          structuralTasks: []}, isNew: true,
        categories: this.categories,
        objectives: this.objectives,
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
        data => {
          if (data) {
            let postData: any = {};
            if (data.data?.name)
              postData['name'] = data.data.name;
            if (data.password)
              postData['password'] = data.password;
            this.adminService.editUser(email, postData).subscribe({
              next: msg => {
                this.confirmDialog.open('user edited');
              }, error: err => this.errorAlert.open(err.error)
            });
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
          this.adminService.deleteUser(email).subscribe({
            next: msg => {
              this.users.splice(index, 1);
              this.userDS.data = this.users;
              this.confirmDialog.open('user deleted');
            },
            error: err => this.errorAlert.open(err)
          });
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
    this.adminService.getColleagues(currentProject.owner).subscribe({
      next: colleagues => {
        this.dialog.open(ProjectDialog, {
          data: {
            project: JSON.parse(JSON.stringify(currentProject)), isNew: false, isAdmin: true,
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
              else {
                // currently only members can be edited in existing project info management
                // only change original project data, not projectDS, since member list is not shown in table
                this.projects[index].members = project.members;
                this.projectService.editProjectMembers(currentProject.name, {
                  inMember: inMember, outMember: outMember
                }).subscribe({
                  next: msg => {
                    this.confirmDialog.open('project edited');
                    //this.projectTable?.renderRows();
                  },
                  error: err => this.errorAlert.open(err.error)
                });
              }
            }
          }
        );
      }, error: err => this.errorAlert.open(err.error)
    });
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
          this.projectService.deleteProject(name).subscribe({
            next: msg => {
              this.projects.splice(index, 1);
              this.projectDS.data = this.projects;
              this.confirmDialog.open('project deleted');
            }, error: err => this.errorAlert.open(err)
          });
      }
    );
  }

}
