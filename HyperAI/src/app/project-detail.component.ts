import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) { }

  private sub: Subscription | null = null;

  project: Project = {
    name: '', dataURI: '', projectType: 'sequential', category: 'structural',
    members: [], owner: 'self', structuralTasks: [], textTasks: [], visionTasks: [],
    createdAt: new Date(), updatedAt:new Date()
  };

  tasks: (StructuralTask | TextTask | VisionTask)[] = [];

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      if (!params['id'])
        this.router.navigate(['/project-manager']);
      this.projectService.getProject(params['id']).subscribe(
        project => {
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
        }
        , err => {
          if (err.status == 404)
            this.router.navigate(['/project-manager']);
          else
            this.errorAlert.open(err);
        }
      )
    })
  }

  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();

  }

  addTask() {
    let dialogRef: MatDialogRef<VisionTaskDialog | TextTaskDialog | StructuralTaskDialog> | null = null;
    switch (this.project.category) {
      case 'vision':
        this.dialog.open(VisionTaskDialog, {
          data: {
            task: {
              name: '',
              taskType: 'preprocessing',
              includeMask: false,
              completed: false,
              preprocessed: false
            },
            isNew: true
          },
          hasBackdrop: true
        }).afterClosed().subscribe(task => {
          if (task)
            this.projectService.addTask(this.project.name, 'vision', task).subscribe(
              msg => {
                this.project.visionTasks.push(task);
                this.confirmDialog.open('task added');
              }, err => this.errorAlert.open(err)
            );
        });
        break;
      case 'text':
        this.dialog.open(TextTaskDialog, {
          data: {
            task: { name: '' }, isNew: true
          },
          hasBackdrop: true
        }).afterClosed().subscribe(
          task => {
            if (task)
              this.projectService.addTask(this.project.name, 'text', task).subscribe(
                msg => {
                  this.project.textTasks.push(task);
                  this.confirmDialog.open('task added');
                }, err => this.errorAlert.open(err)
              );
          }
        );
        break;
      case 'structural':
        this.dialog.open(StructuralTaskDialog, {
          data: {
            task: { name: '', taskType: 'recommendataion' },
            isNew: true
          },
          hasBackdrop: true
        }).afterClosed().subscribe(
          task => {
            if(task)
              this.projectService.addTask(this.project.name, 'structural', task).subscribe(
                msg => {
                  this.project.structuralTasks.push(task);
                  this.confirmDialog.open('task added');
                }, err => this.errorAlert.open(err)
              );
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
    this.dialog.open(VisionTaskDialog, {
      data: { task: task, isNew: false },
      hasBackdrop: true
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'vision', task.name, modification).subscribe(
            msg => {
              Object.assign(this.project.visionTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, err => this.errorAlert.open(err)
          );
      });
  }

  deleteTask(name: string) {
    this.projectService.deleteTask(this.project.name, this.project.category, name).subscribe(
      msg => {
        const id = this.tasks.findIndex(elem => elem.name == name);
        this.tasks.splice(id, 1);
        this.confirmDialog.open('task deleted');
      }, err => this.errorAlert.open(err)
    );
  }

  editTextTask(index: number) {
    const task = this.project.textTasks[index];
    this.dialog.open(TextTaskDialog, {
      data: { task: task, isNew: false },
      hasBackdrop: true
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'text', task.name, modification).subscribe(
            msg => {
              Object.assign(this.project.textTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, err => this.errorAlert.open(err)
          );
      }
    );
  }

  editStructuralTask(index: number) {
    const task = this.project.structuralTasks[index];
    this.dialog.open(StructuralTaskDialog, {
      data: { task: task, isNew: false },
      hasBackdrop: true
    }).afterClosed().subscribe(
      modification => {
        if (modification)
          this.projectService.editTask(this.project.name, 'structural', task.name, modification).subscribe(
            msg => {
              Object.assign(this.project.structuralTasks[index], modification);
              this.confirmDialog.open('task modified');
            }, err => this.errorAlert.open(err)
          );
      }
    );
  }

}
