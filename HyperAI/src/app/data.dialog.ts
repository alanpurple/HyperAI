import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DataInfo } from "./data.info";


@Component({
  selector: 'data-dialog',
  templateUrl: './data.dialog.html'
})
export class DataDialog {
  constructor(
    public dialogRef: MatDialogRef<DataDialog>
  ) { }

  data: DataInfo = {
    name: '',
    type: 'structural',
    locationType: 'local',
    numRows: 10000,
    isClean: false,
    cleansed: null,
    preprocessed: null
  };

  types = ['structural', 'sound', 'text', 'vision'];
  locationTypes = ['db uri', 'local', 'smb', 'datalake', 'aws s3'];

  cancel() {
    this.dialogRef.close();
  }

  reset() {
    this.data = {
      name: '',
      type: 'structural',
      locationType: 'local',
      numRows: 10000,
      isClean: false,
      cleansed: null,
      preprocessed: null
    };
  }
}
