import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ProjectDialog } from './project.dialog';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass']
})
export class ProjectComponent implements OnInit {

  constructor(
    public projectDialog: MatDialog,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
  }

  createProject() {

  }

  editProject(name: string) {

  }
}
