import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { UserService } from './user.service';
import { ErrorAlert } from './shared/error.alert';
import { UserData } from './user.data';

import { NameRe } from './shared/validataions';
import { DOCUMENT, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ForbiddenValidatorDirective } from './shared/forbidden-name.directive';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'app-user.info',
    templateUrl: './user.info.html',
    styleUrls: ['./user.info.sass'],
    standalone: true,
    imports: [MatCardModule, FlexModule, MatFormFieldModule, MatInputModule, FormsModule, NgIf, ForbiddenValidatorDirective, MatButtonModule]
})
export class UserInfo implements OnInit {

  constructor(
    private dialog: MatDialog,
    private errorAlert: ErrorAlert,
    private userService: UserService,
    @Inject(DOCUMENT) private doc: Document
  ) { }

  user: UserData = new UserData();
  nickName: string = '';
  nameRe = NameRe;

  ngOnInit(): void {
    this.userService.getUser().subscribe({
      next: user => {
        this.user = user;
      }, error: err => this.errorAlert.open(err.message)
    });
  }

  checkNick() {
    if (!this.nickName)
      return;
    this.userService.checkNick(this.nickName)
      .subscribe(result => {
        if (result) {
          this.dialog.open(NickNameConfirmDialog, { data: this.nickName })
            .afterClosed()
            .subscribe(yes => {
              console.log(yes);
              if (yes)
                this.userService.updateUser({ nickName: this.nickName })
                  .subscribe({
                    next: res => this.doc.location.href = '/',
                    error: err => this.errorAlert.open(err.message)
                  });
              else
                this.nickName = '';
            });
        }
        else
          this.dialog.open(NickNameTakenDialog).afterClosed()
            .subscribe(() => this.nickName = '');
      });
  }

}

@Component({
    template: `
                <h3 mat-dialog-title>Work in progress...</h3>
                <div mat-dialog-content>Going back to home.</div>
                <div mat-dialog-actions>
                <button mat-button color="primary" mat-dialog-close>Confirm</button>
                </div>
              `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule]
})
export class ComingSoonDialog { }

@Component({
    template: `
                <h3 mat-dialog-title>Use this nickname({{data}})?</h3>
                <div mat-dialog-content>You can't change your nickname once you've decided
                </div>
                <button mat-button color="accent" [mat-dialog-close]="true">Use this</button>
                <button mat-button color="primary" mat-dialog-close>Choose again</button>
              `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule]
})
export class NickNameConfirmDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}

@Component({
    template: `
                <h3 mat-dialog-title>Nickname Already taken</h3>
                <div mat-dialog-content>Choose another nick please</div>
                <div mat-dialog-actions>
                <button mat-button mat-dialog-close>Confirm</button>
                </div>
              `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule]
})
export class NickNameTakenDialog { }
