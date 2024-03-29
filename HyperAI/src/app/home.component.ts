import { Component, OnInit } from '@angular/core';
import { ConfirmDialog } from './shared/confirm.dialog';
import { ErrorAlert } from './shared/error.alert';
import { Project } from './project.data';
import { ProjectService } from './project.service';
import { UserService } from './user.service';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.sass'],
    standalone: true,
    imports: [NgIf, FlexModule, MatCardModule, MatButtonModule, RouterLink, NgFor, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, MatChipsModule]
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
    this.userService.getUser().subscribe({
      next: user => {
        if (user.accountType == 'admin')
          this.isAdmin = true;
        else if (user.accountType == 'user')
          this.isUser = true;
        else
          this.confirmDialog.open('unknown account type');
        this.projectService.getProjects().subscribe({
          next: projects => this.projects = projects,
          error: err => {
            if (err.status != 404)
              this.errorAlert.open(err.error);
          }
        });
      },
      error: err => {
        if (err.status != 401)
          this.errorAlert.open(err);
      }
    });
  }
}
