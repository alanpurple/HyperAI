import { Component, OnInit } from '@angular/core';
import { ConfirmDialog } from './confirm.dialog';
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
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog
  ) { }

  projects: Project[] = [];
  isUser: boolean = false;
  isAdmin: boolean = false;
  
  ngOnInit(): void {
    this.userService.getUser().subscribe(
      user => {
        if (user.accountType == 'admin')
          this.isAdmin = true;
        else if (user.accountType == 'user')
          this.isUser = true;
        else
          this.confirmDialog.open('unknown account type');
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
