import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass']
})
export class SignupComponent {

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  email: string = '';
  emailChecked: boolean = false;
  password: string = '';
  passwordConfirm: string = '';

  checkEmail(): void {
    this.userService.checkuser(this.email)
      .subscribe(
        msg => this.router.navigate(['/login', encodeURI(this.email)]),
        err => {
          if (err.status == 404) {
            console.info('등록 가능 계정');
            this.emailChecked = true;
          }
        });
  }

  resetEmail(): void {
    this.emailChecked = false;
    this.email = '';
    this.password = '';
    this.passwordConfirm = '';
  }

}
