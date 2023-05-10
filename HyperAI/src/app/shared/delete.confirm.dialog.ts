import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
    template: `
                <h3 mat-dialog-title>
                    Really wanna delete?
                </h3>
                <div mat-dialog-actions>
                  <button mat-button color="accent" [mat-dialog-close]="true">Confirm</button>
                  <button mat-button color="warn" [mat-dialog-close]="false">Cancel</button>
                </div>
              `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule]
})
export class DeleteConfirmDialog { }
