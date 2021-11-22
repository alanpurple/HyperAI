import { Component } from "@angular/core";

@Component({
  template: `
                <h3 mat-dialog-title>
                    Really wanna delete?
                </h3>
                <div mat-dialog-actions>
                  <button mat-button color="accent" [mat-dialog-close]="true">Confirm</button>
                  <button mat-button color="warn" [mat-dialog-close]="false">Cancel</button>
                </div>
              `
})
export class DeleteConfirmDialog { }
