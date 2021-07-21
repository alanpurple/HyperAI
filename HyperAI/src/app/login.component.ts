import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from './user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  email: string = '';
  password: string = '';
  emailChecked: boolean = false;
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.email = decodeURI(params['id']);
        this.emailChecked = true;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();
  }

  checkEmail() {
    this.userService.checkuser(this.email)
      .subscribe(
        msg => {
          console.info('Valid account');
          this.emailChecked = true;
        },
        err => {
          if (err.status == 404)
            console.info('no account');
          else
            console.error(err);
        });
  }

  resetEmail() {
    this.emailChecked = false;
    this.email = '';
    this.password = '';
  }
}
