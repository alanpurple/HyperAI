import { Component, OnInit } from '@angular/core';
import { ErrorAlert } from './error.alert';
import { Project } from './project.data';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private errorAlert: ErrorAlert
  ) { }

  projects: Project[] = [];
  
  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      projects => this.projects = projects,
      err => {
        if (err.status != 404)
          this.errorAlert.open(err);
      }
    );
  }
}
