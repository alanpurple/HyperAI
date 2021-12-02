import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialog } from './shared/confirm.dialog';
import { ErrorAlert } from './shared/error.alert';
import { Project } from './project.data';

import { ProjectDialog } from './project.dialog';
import { DeleteConfirmDialog } from './shared/delete.confirm.dialog';
import { ProjectService } from './project.service';
import { UserService } from './user.service';
import { DataService } from './data.service';
import { DataInfo } from './data.info';

import { NameRe } from './shared/validataions'
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass']
})
export class ProjectComponent implements OnInit, AfterViewInit {

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private dataService: DataService,
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog
  ) {
    if (window.outerWidth < 1200)
      this.isSmallDevice = true;
    else
      this.displayedColumns = ['name', 'owner', 'dataURI', 'createdAt', 'updatedAt', 'projectType', 'category','objective', 'edit', 'delete'];
  }

  isSmallDevice = false;
  nameRe = NameRe;

  projectDS = new MatTableDataSource([] as Project[]);
  @ViewChild(MatSort) sort: MatSort | null = null;

  ngAfterViewInit() {
    this.projectDS.sort = this.sort;
  }

  isMaking: boolean = false;
  projects: Project[] = [];
  newProject: Project = {
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
  colleagues: string[] = [];

  roles = ['member', 'attendee'];
  categories = ['various', 'vision', 'text', 'structural'];
  objectives = ['classification', 'regression',
    // only for text
    'qna', 'translation',
    // only for vision
    'segmentation', 'object detection',
    'clustering', 'anomaly detection', 'recommendation'];
  displayedColumns = ['name','owner', 'dataURI', 'projectType', 'category', 'edit', 'delete'];

  userData: DataInfo[] = [];
  dataList: DataInfo[] = [];


  


  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      projects => {
        this.projects = projects;
        this.projectDS.data = projects;
      },
      err => {
        if (err.status != 404)
          this.errorAlert.open(err.error);
      }
    );
    this.userService.getColleagues().subscribe(
      users => this.colleagues = users,
      err => {
        //not found
        if (err.status != 404)
          this.errorAlert.open(err.error);
      }
    );
    this.dataService.getDataPublic().subscribe(
      data => {
        this.userData = data;
        this.userService.getUser().subscribe(
          user => {
            this.userData = this.userData.concat(user.data);
            this.filterData();
          },
          err => this.errorAlert.open(err.error)
        );
      }, err => this.errorAlert.open(err.error)
    );
  }

  //using dialog
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
          structuralTasks: []
        },
        isNew: true,
        availableMembers: this.colleagues,
        userData: this.userData,
        dataList: this.dataList,
        categories: this.categories,
        objectives: this.objectives
      }
    }).afterClosed().subscribe(project => {
      if (project)
        this.projectService.createProject(project).subscribe(
          msg => {
            this.projects.push(project);
            this.projectDS.data = this.projects;
            this.confirmDialog.open('project created successfully');
          },
          err => this.errorAlert.open(err.error)
        );
    });
  }

  availableMembers: string[] = [];
  //using stepper
  createProjectEasy() {
    this.isMaking = true;
    this.availableMembers = this.colleagues;
  }

  cancelMaking() {
    this.newProject = {
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
    this.isMaking = false;
    this.dataList = [];
  }

  resetMaking() {
    this.newProject = {
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
    this.dataList = [];
  }

  filterData() {
    const category = this.newProject.category;
    this.dataList = this.userData.filter(elem => elem.type == category);
  }

  addMember(index: number) {
    this.newProject.members.push({ user: this.availableMembers[index], role: 'attendee' });
    this.availableMembers.splice(index, 1);
  }

  removeUser(index: number) {
    this.availableMembers.push(this.newProject.members[index].user);
    this.newProject.members.splice(index, 1);
  }

  postCreated() {
    this.projectService.createProject(this.newProject).subscribe(
      msg => {
        this.projects.push(this.newProject);
        this.projectDS.data = this.projects;
        //this.projectTable?.renderRows();
        this.newProject = {
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
        this.confirmDialog.open('project created successfully');
        this.isMaking = false;
        this.dataList = [];
      },
      err => this.errorAlert.open(err.error)
    );
  }

  //only dialog
  editProject(name: string) {
    const index = this.projects.findIndex(elem => elem.name == name);
    if (index < 0) {
      this.errorAlert.open('error, cannot edit null project');
      return;
    }
    const currentProject = this.projects[index];
    const projectMembers = currentProject.members.map(elem => elem.user);
    this.dialog.open(ProjectDialog, {
      data: {
        project: JSON.parse(JSON.stringify(currentProject)),
        isNew: false,
        availableMembers: this.colleagues.filter(elem => !projectMembers.includes(elem)),
        categories: this.categories,
        objectives: this.objectives
      }
    }).afterClosed().subscribe(project => {
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
          }).subscribe(msg => {
            this.confirmDialog.open('project edited');
            //this.projectTable?.renderRows();
          },
            err => this.errorAlert.open(err.error));
        }
      }
    });
  }

  deleteProject(name: string) {
    const index = this.projects.findIndex(elem => elem.name == name);
    if (index < 0) {
      this.errorAlert.open('cannot delete null');
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
            }
          );
      }
    );
  }

  isValidObjective(objective: string) {
    if (['qna', 'translation'].includes(objective) && this.newProject.category != 'text')
      return false;
    if (['segmentation', 'object detection'].includes(objective) && this.newProject.category != 'vision')
      return false;
    return true;
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
}
