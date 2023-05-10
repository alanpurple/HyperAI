import { Component } from "@angular/core";
import { DataInfo } from "./data.info";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { NgFor } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FlexModule } from "@angular/flex-layout/flex";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";


@Component({
    selector: 'data-dialog',
    templateUrl: './data.dialog.html',
    standalone: true,
    imports: [MatDialogModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, MatSelectModule, NgFor, MatOptionModule, MatButtonModule]
})
export class DataDialog {
  constructor() { }

  data: DataInfo = {
    name: '',
    uri:'',
    type: 'structural',
    locationType: 'local',
    numRows: 10000,
    isClean: false,
    cleansed: null,
    preprocessed: null
  };

  types = ['structural', 'sound', 'text', 'vision'];
  locationTypes = ['db uri', 'local', 'smb', 'datalake', 'aws s3'];

  reset() {
    this.data = {
      name: '',
      uri:'',
      type: 'structural',
      locationType: 'local',
      numRows: 10000,
      isClean: false,
      cleansed: null,
      preprocessed: null
    };
  }
}
