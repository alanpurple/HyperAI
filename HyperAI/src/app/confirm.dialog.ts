import { Component, Injectable, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
                <h3 mat-dialog-title>{{data}}</h3>
                <div mat-dialog-actions>
                <button mat-button mat-dialog-close>Confirm</button>
                </div>
              `
})
export class ConfirmDialogTemplate {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}

@Injectable()
export class ConfirmDialog {
  constructor(private dialog: MatDialog) { }

  open(message?: string) {
    this.dialog.open(ConfirmDialogTemplate, {
      data: message ? message : 'Confirm message'
    });
  }
}
