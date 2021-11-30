import { Component } from "@angular/core";
import { DataInfo } from "./data.info";


@Component({
  selector: 'data-dialog',
  templateUrl: './data.dialog.html'
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
