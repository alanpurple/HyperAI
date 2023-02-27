import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmDialog } from './shared/confirm.dialog';
import { ErrorAlert } from './shared/error.alert';

import { Project, StructuralTask, TextTask, VisionTask } from './project.data';
import { ProjectService } from './project.service';
import { StructuralTaskDialog, TextTaskDialog, VisionTaskDialog } from './task.dialog';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.sass']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

  constructor(
    public dialog: MatDialog,
    private confirmDialog: ConfirmDialog,
    private errorAlert: ErrorAlert,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) { }

  private sub: Subscription | null = null;

  project: Project = {
    name: '', dataURI: '', projectType: 'sequential', category: 'structural',
    objective: 'classification',
    members: [], owner: 'self', structuralTasks: [], textTasks: [], visionTasks: [],
    createdAt: new Date(), updatedAt:new Date()
  };

  tasks: (StructuralTask | TextTask | VisionTask)[] = [];

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      if (!params['id'])
        this.router.navigate(['/project-manager']);
      else if (params['id'] == 'new') {
        this.errorAlert.open('something\'s wrong, project name cannot be \'new\'');
        return;
      }
      this.projectService.getProject(params['id']).subscribe({
        next: project => {
          console.log(project);
          this.project = project;
          switch (project.category) {
            case 'vision':
              this.tasks = this.project.visionTasks;
              break;
            case 'text':
              this.tasks = this.project.textTasks;
              break;
            case 'structural':
              this.tasks = this.project.structuralTasks;
              break;
            default:
              this.errorAlert.open('unreachable part');
          }
          this.route.url.subscribe(elems => {
            if (elems.length == 3 && elems[2]?.path == 'auto') {
              if (this.tasks.length > 0)
                this.location.back();
              else {
                this.autoGenerate();
                this.location.go('/project-manager/' + elems[1]);
              }
            }
          });
        }
        , error: err => {
          if (err.status == 404) {
            this.confirmDialog.open('Cannot find the project ' + params['id']);
            this.router.navigate(['/project-manager']);
          }
          else
            this.errorAlert.open(err.error);
        }
      })
    })
  }

  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();

  }

  addTask() {
    //let dialogRef: MatDialogRef<VisionTaskDialog | TextTaskDialog | StructuralTaskDialog> | null = null;
    switch (this.project.category) {
      case 'vision':
        this.dialog.open(VisionTaskDialog, {
          data: {
            task: {} as VisionTask,
            isNew: true
          }
        }).afterClosed().subscribe(task => {
          if (task)
            this.projectService.addTask(this.project.name, 'vision', task).subscribe({
              next: msg => {
                this.project.visionTasks.push(task);
                this.confirmDialog.open('task added');
              }, error: err => this.errorAlert.open(err.error)
            });
        });
        break;
      case 'text':
        this.dialog.open(TextTaskDialog, {
          data: {
            task: {} as TextTask, isNew: true
          }
        }).afterClosed().subscribe(
          task => {
            if (task)
              this.projectService.addTask(this.project.name, 'text', task).subscribe({
                next: msg => {
                  this.project.textTasks.push(task);
                  this.confirmDialog.open('task added');
                }, error: err => this.errorAlert.open(err.error)
              });
          }
        );
        break;
      case 'structural':
        this.dialog.open(StructuralTaskDialog, {
          data: {
            task: {} as StructuralTask,
            isNew: true
          }
        }).afterClosed().subscribe(
          task => {
            if(task)
              this.projectService.addTask(this.project.name, 'structural', task).subscribe({
                next: msg => {
                  this.project.structuralTasks.push(task);
                  this.confirmDialog.open('task added');
                }, error: err => this.errorAlert.open(err.error)
              });
          }
        );
        break;
      default:
        this.errorAlert.open('unknown task type');
        break;
    }
  }

  editTask(index: number) {
    switch (this.project.category) {
      case 'structural':
        this.editStructuralTask(index);
        break;
      case 'text':
        this.editTextTask(index);
        break;
      case 'vision':
        this.editVisionTask(index);
        break;
      default:
        this.errorAlert.open('unreachable part');
    }
  }

  editVisionTask(index: number) {
    const task = this.project.visionTasks[index];
    const taskName = task.name;
    this.dialog.open(VisionTaskDialog, {
      data: { task: JSON.parse(JSON.stringify(task)), isNew: false }
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'vision', taskName, modification).subscribe({
            next: msg => {
              Object.assign(this.project.visionTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, error: err => this.errorAlert.open(err.error)
          });
      });
  }

  editTextTask(index: number) {
    const task = this.project.textTasks[index];
    const taskName = task.name;
    this.dialog.open(TextTaskDialog, {
      data: { task: JSON.parse(JSON.stringify(task)), isNew: false }
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'text', taskName, modification).subscribe({
            next: msg => {
              Object.assign(this.project.textTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, error: err => this.errorAlert.open(err.error)
          });
      }
    );
  }

  editStructuralTask(index: number) {
    const task = this.project.structuralTasks[index];
    const taskName = task.name;
    this.dialog.open(StructuralTaskDialog, {
      data: { task: JSON.parse(JSON.stringify(task)), isNew: false }
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'structural', taskName, modification).subscribe({
            next: msg => {
              Object.assign(this.project.structuralTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, error: err => this.errorAlert.open(err.error)
          });
      }
    );
  }

  deleteTask(i: number) {
    const task = this.tasks[i];
    this.projectService.deleteTask(this.project.name, this.project.category, task.name).subscribe({
      next: msg => {
        this.tasks.splice(i, 1);
        this.confirmDialog.open('task deleted');
      }, error: err => this.errorAlert.open(err.error)
    });
  }

  autoGenerate() {
    if (this.tasks.length == 0) {
      this.projectService.autoMl(this.project.name).subscribe({
        next: tasks => {
          switch (this.project.category) {
            case 'vision':
              Array.prototype.push.apply(this.project.visionTasks, tasks);
              break;
            case 'text':
              Array.prototype.push.apply(this.project.textTasks, tasks);
              break;
            case 'structural':
              Array.prototype.push.apply(this.project.structuralTasks, tasks);
              break;
            case 'various':
              this.confirmDialog.open('sorry, automl for various type is not supported yet');
              return;
            default:
              this.errorAlert.open('unreachable part');
          }
          this.confirmDialog.open('AutoML generation process completed');
        },
        error: err => this.errorAlert.open('automl failed, server error')
      })
    }
  }

}
