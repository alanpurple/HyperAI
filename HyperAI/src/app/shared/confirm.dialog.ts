import { Component, Injectable, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
                <h3 mat-dialog-title>
                    <div *ngFor="let elem of data">{{elem}}<br></div>
                </h3>
                <div mat-dialog-actions>
                <button mat-button color="accent" mat-dialog-close>Confirm</button>
                </div>
              `
})
export class ConfirmDialogTemplate2 {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}

@Component({
  template: `
                <h3 mat-dialog-title>{{data}}</h3>
                <div mat-dialog-actions>
                <button mat-button color="accent" mat-dialog-close>Confirm</button>
                </div>
              `
})
export class ConfirmDialogTemplate {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}

@Injectable()
export class ConfirmDialog {
  constructor(private dialog: MatDialog) { }
  isArray: boolean = false;
  open(message?: string | string[]) {
    let msg = null;
    if (!message)
      msg = 'Confirmation';
    else if (typeof (message) == 'string')
      msg = message;
    else if (Array.isArray(message)) {
      this.isArray = true;
      msg = message;
    }

    if (this.isArray)
      this.dialog.open(ConfirmDialogTemplate2, {
        data: msg
      });
    else
      this.dialog.open(ConfirmDialogTemplate, {
        data: msg
      });
  }
}
