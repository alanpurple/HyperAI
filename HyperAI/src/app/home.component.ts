import { Component, OnInit } from '@angular/core';
import { ErrorAlert } from './error.alert';
import { Project } from './project.data';
import { ProjectService } from './project.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private errorAlert: ErrorAlert
  ) { }

  projects: Project[] = [];
  loggedIn: boolean = false;
  
  ngOnInit(): void {
    this.userService.getUser().subscribe(
      user => {
        this.loggedIn = true;
        this.projectService.getProjects().subscribe(
          projects => this.projects = projects,
          err => {
            if (err.status != 404)
              this.errorAlert.open(err);
          }
        );
      }
    );
  }
}
