import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from './user.service';
import { ErrorAlert } from './shared/error.alert';

import { NameRe } from './shared/validataions';
import { Subscription } from 'rxjs';
import { Location, NgIf, NgFor } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ForbiddenValidatorDirective } from './shared/forbidden-name.directive';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.sass'],
    standalone: true,
    imports: [MatCardModule, MatToolbarModule, FlexModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ExtendedModule, ForbiddenValidatorDirective, NgIf, MatAutocompleteModule, NgFor, MatOptionModule]
})
export class SignupComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private errorAlert: ErrorAlert,
    private location: Location
  ) { }

  organizations: string[] = [];
  private sub: Subscription | null = null;

  ngOnInit() {
    // check process for 'back' button
    this.userService.getUser().subscribe(
      user => this.location.back(),
      err => {
        if (err.status != 401)
          this.errorAlert.open(err.error);
      }
    );
    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.email = decodeURI(params['id']);
        this.emailChecked = true;
      }
    })
    this.userService.getOrganizations().subscribe(
      orgs => this.organizations = orgs,
      err => this.errorAlert.open(err.error)
    );
  }

  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();
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
            this.errorAlert.open(err.error);
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

  nameInvalid = false;
  checkName() {
    this.nameInvalid=NameRe.test(this.name);
  }

}
