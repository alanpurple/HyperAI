import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from './user.service';
import { ErrorAlert } from './shared/error.alert';
import { Location, DOCUMENT, NgIf } from '@angular/common';
import { ConfirmDialog } from './shared/confirm.dialog';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.sass'],
    standalone: true,
    imports: [MatCardModule, MatToolbarModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, NgIf, MatButtonModule, ExtendedModule, RouterLink]
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private errorAlert: ErrorAlert,
    private confirmDialog: ConfirmDialog,
    private location: Location,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private doc: Document
  ) { }

  email = new FormControl('', [Validators.required, Validators.email]);
  password: string = '';
  emailChecked: boolean = false;
  private sub: Subscription | null = null;
  mailNotFound = false;

  ngOnInit(): void {
    // check process for 'back' button
    this.userService.getUser().subscribe({
      next: user => this.location.back(),
      error: err => {
        if (err.status != 401)
          this.errorAlert.open(err.error);
      }
    })
    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.email = new FormControl(decodeURI(params['id']), [Validators.required, Validators.email]);
        this.checkEmail();
      }
    });
  }

  ngOnDestroy() {
    if (this.sub)
      this.sub.unsubscribe();
  }

  onEmailChange() {
    this.emailChecked = false;
    this.mailNotFound = false;
  }

  checkEmail() {
    if (!this.email.value||this.email.invalid)
      return;
    const email = this.email.value;
    this.userService.checkuser(email)
      .subscribe({
        next: msg => {
          console.info('Valid account');
          this.emailChecked = true;
          this.mailNotFound = false;
        },
        error: err => {
          if (err.status == 404) {
            //this.router.navigate(['/signup', encodeURI(this.email)]);
            this.dialog.open(NoEmailDialog, { data: this.email.value }).afterClosed().subscribe(
              canGo => {
                console.log(canGo)
                if (canGo)
                  this.router.navigate(['/signup', encodeURI(email)]);
              }
            );
            this.mailNotFound = true;
          }
          else
            this.errorAlert.open(err.error);
        }
      });
  }

  resetEmail() {
    this.emailChecked = false;
    this.mailNotFound = false;
    this.email.reset();
    this.password = '';
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  passwordWrong = false;

  onSubmit() {
    if (!this.email.value||this.email.invalid)
      return;
    this.userService.login(this.email.value, this.password).subscribe({
      next: msg => {
        if (msg == 'ok')
          this.doc.location.href = '/';
        else if (msg == 'nonick')
          this.doc.location.href = '/user-info';
        else
          this.errorAlert.open('unexpected message, don know what to do');
      }, error: err => {
        if (err.status == 401) {
          this.confirmDialog.open('Invalid email or password');
          this.passwordWrong = true;
        }
        else
          this.errorAlert.open(err.error);
      }
    })
  }
}

@Component({
    template: `
                <h3 mat-dialog-title>Email not Found</h3>
                <div mat-dialog-content>
                  Want to register with this email {{data}} ?
                </div>
                <div mat-dialog-actions>
                <button mat-button color="accent" [mat-dialog-close]="true">Go</button>
                <button mat-button color="accent" mat-dialog-close>Cancel</button>
                </div>
              `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule]
})
export class NoEmailDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}
