import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { UserData } from "./user.data";
import { MatButtonModule } from "@angular/material/button";
import { MatRadioModule } from "@angular/material/radio";
import { MatOptionModule } from "@angular/material/core";
import { NgFor, NgIf } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FlexModule } from "@angular/flex-layout/flex";
import { FormsModule } from "@angular/forms";
import { ExtendedModule } from "@angular/flex-layout/extended";

@Component({
    selector: 'user-dialog',
    templateUrl: './user.dialog.html',
    standalone: true,
    imports: [MatDialogModule, ExtendedModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, MatSelectModule, NgFor, MatOptionModule, MatRadioModule, NgIf, MatButtonModule]
})
export class UserDialog {
  constructor(
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      user: UserData, isNew: boolean, organizations: string[]
    }
  ) {
    if (!data.isNew)
      this.originalData = JSON.parse(JSON.stringify(data.user));
  }
  originalData: UserData = new UserData();
  password: string = '';

  reset() {
    this.data.user = this.originalData;
    this.password = '';
  }

  save() {
    if (this.data.isNew)
      this.dialogRef.close({ data: this.data.user, password: this.password });
    else if (this.password) {
      if (this.data.user.name != this.originalData.name)
        this.dialogRef.close({ data: { name: this.data.user.name }, password: this.password });
      else
        this.dialogRef.close({ password: this.password });
    }
    else {
      if (this.data.user.name != this.originalData.name)
        this.dialogRef.close({ data: { name: this.data.user.name } });
      else
        this.dialogRef.close({ data: {} });
    }
  }
}
