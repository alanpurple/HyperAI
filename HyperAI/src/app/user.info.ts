import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { ErrorAlert } from './error.alert';
import { UserData } from './user.data';


@Component({
  selector: 'app-user.info',
  templateUrl: './user.info.html',
  styleUrls: ['./user.info.sass']
})
export class UserInfo implements OnInit {

  constructor(
    private dialog: MatDialog,
    private errorAlert: ErrorAlert,
    private router: Router,
    private userService: UserService
  ) { }

  user: UserData|null = null;
  nickName: string|null = null;

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.user = user;
      if (user.nickName) {
        this.nickName = user.nickName;
        this.dialog.open(ComingSoonDialog).afterClosed()
          .subscribe(() => this.router.navigate(['/']));
      }
    }, err => this.errorAlert.open(err.message));
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
                this.userService.saveUser({ nickName: this.nickName })
                  .subscribe(res => this.router.navigate(['/']),
                    err => this.errorAlert.open(err.message));
              else
                this.nickName = null;
            });
        }
        else
          this.dialog.open(NickNameTakenDialog).afterClosed()
            .subscribe(() => this.nickName = null);
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
              `
})
export class ComingSoonDialog { }

@Component({
  template: `
                <h3 mat-dialog-title>Use this nickname({{data}})?</h3>
                <div mat-dialog-content>You can't change your nickname once you've decided
                </div>
                <button mat-button color="accent" [mat-dialog-close]="true">Use this</button>
                <button mat-button color="primary" mat-dialog-close>Choose again</button>
              `
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
              `
})
export class NickNameTakenDialog { }
