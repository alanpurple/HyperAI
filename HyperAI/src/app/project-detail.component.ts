import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { StructuralTask, TextTask, VisionTask } from './project.data';
import { StructuralTaskDialog, TextTaskDialog, VisionTaskDialog } from './task.dialog';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.sass']
})
export class ProjectDetailComponent implements OnInit {

  constructor(
    public taskDialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  addTask() {

  }

  editTask(name:string) {

  }

}
