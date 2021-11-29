import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
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

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass']
})
export class ProjectComponent implements OnInit {

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private dataService: DataService,
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog
  ) { }

  nameRe = NameRe;

  @ViewChild('projectTable') projectTable: MatTable<Project> | null = null;

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
    owner: '',
    members: [],
    visionTasks: [],
    textTasks: [],
    structuralTasks: []
  };
  colleagues: string[] = [];

  roles = ['member', 'attendee'];
  categories = ['various', 'vision', 'text', 'structural'];
  objectives = ['classification' , 'regression',
    // only for text
    'qna' ,
    // only for vision
    'segmentation' , 'object detection' ,
    'clustering' , 'anomaly detection' , 'translation' , 'recommendation']
  displayedColumns = ['name','owner', 'dataURI', 'projectType', 'category', 'edit', 'delete'];

  userData: DataInfo[] = [];
  dataList: DataInfo[] = [];


  


  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      projects => this.projects = projects,
      err => {
        if (err.status != 404)
          this.errorAlert.open(err);
      }
    );
    this.userService.getColleagues().subscribe(
      users => this.colleagues = users,
      err => {
        //not found
        if (err.status != 404)
          this.errorAlert.open(err);
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
          err => this.errorAlert.open(err)
        );
      }, err => this.errorAlert.open(err)
    );
  }

  //using dialog
  createProject() {
    const dialogRef = this.dialog.open(ProjectDialog, {
      data: {
        project: {
          name: '',
          dataURI: '',
          projectType: 'single',
          category: 'structural',
          owner: '',
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
      },
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe(project => {
      if(project)
        this.projectService.createProject(project).subscribe(
          msg => {
            this.projects.push(project);
            this.projectTable?.renderRows();
            this.confirmDialog.open('project created successfully');
          },
          err => this.errorAlert.open(err)
        );
    }
    );
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
      owner: '',
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
        this.projectTable?.renderRows();
        this.newProject = {
          name: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          dataURI: '',
          projectType: 'single',
          category: 'structural',
          objective: 'classification',
          owner: '',
          members: [],
          visionTasks: [],
          textTasks: [],
          structuralTasks: []
        };
        this.confirmDialog.open('project created successfully');
        this.isMaking = false;
        this.dataList = [];
      }
    )
  }

  //only dialog
  editProject(index: number) {
    const currentProject = this.projects[index];
    const projectMembers = currentProject.members.map(elem => elem.user);
    const dialogRef = this.dialog.open(ProjectDialog, {
      data: {
        project: currentProject,
        isNew: false,
        availableMembers: this.colleagues.filter(elem => !projectMembers.includes(elem)),
        categories: this.categories,
        objectives: this.objectives
      },
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe(project => {
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
        else
          // currently only members can be edited in existing project info management
          this.projectService.editProjectMembers(currentProject.name, {
            inMember: inMember, outMember: outMember
          }).subscribe(msg => {
            this.confirmDialog.open('project edited');
            this.projectTable?.renderRows();
          },
            err => this.errorAlert.open(err));
      }
    });
  }

  deleteProject(index: number) {
    this.dialog.open(DeleteConfirmDialog, { hasBackdrop:true }).afterClosed().subscribe(
      selection => {
        if (selection)
          this.projectService.deleteProject(this.projects[index].name).subscribe(
            msg => {
              this.projects.splice(index, 1);
              this.confirmDialog.open('project deleted');
              this.projectTable?.renderRows();
            }
          );
      }
    );
  }
}
