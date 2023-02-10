import { Component, Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
                <h3 mat-dialog-title>{{data}}</h3>
                <mat-dialog-content>Returning to home.</mat-dialog-content>
                <div mat-dialog-actions>
                <button mat-button color="accent" mat-dialog-close>Confirm</button>
                </div>
              `
})
export class ErrorDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}

@Injectable({
  providedIn: 'root'
})
export class ErrorAlert {
  constructor(private dialog: MatDialog,
    private router: Router) {
  }

  open(err?: any) {
    let msg = '';
    if (!err)
      msg = 'critical error!';
    else if (typeof err == 'object' && Object.hasOwn(err, 'message'))
      msg = err.message;
    else if (typeof err == 'string')
      msg = err;
    else
      msg = 'uncertain error';
    this.dialog.open(ErrorDialog, {
      data: msg ? msg : 'critical error!'
    }).afterClosed()
      .subscribe(() => this.router.navigate(['/']));
  }
}
