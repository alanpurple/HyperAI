import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import {ErrorAlert } from './error.alert'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass']
})
export class SignupComponent implements OnInit {

  constructor(
    private router: Router,
    private userService: UserService,
    private errorAlert: ErrorAlert
  ) { }
  organizations: string[] = [];
  ngOnInit() {
    this.userService.getOrganizations().subscribe(
      orgs => this.organizations = orgs,
      err => this.errorAlert.open(err)
    );
  }

  organization: string | undefined = undefined;
  email: string = '';
  emailChecked: boolean = false;
  password: string = '';
  passwordConfirm: string = '';
  name: string = '';

  checkEmail(): void {
    this.userService.checkuser(this.email)
      .subscribe(
        msg => this.router.navigate(['/login', encodeURI(this.email)]),
        err => {
          if (err.status == 404) {
            console.info('available email address');
            this.emailChecked = true;
          }
          else
            this.errorAlert.open(err);
        });
  }

  resetEmail(): void {
    this.name = '';
    this.emailChecked = false;
    this.email = '';
    this.organization = undefined;
    this.password = '';
    this.passwordConfirm = '';
  }

}
