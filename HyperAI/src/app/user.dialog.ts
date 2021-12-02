import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UserData } from "./user.data";

@Component({
  selector: 'user-dialog',
  templateUrl: './user.dialog.html'
})
export class UserDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      user: UserData, isNew: boolean, organizations: string[]
    }
  ) {
    if (!data.isNew)
      this.originalData = data.user;
  }
  originalData: UserData = new UserData();

  reset() {
    this.data.user = this.originalData;
  }
}
