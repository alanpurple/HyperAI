import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';

import { DataInfo } from './data.info';
import { DataDatabase, DataService } from './data.service';
import { ConfirmDialog } from './confirm.dialog';
import { ErrorAlert } from './error.alert';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.sass']
})
export class DataComponent implements OnInit, AfterViewInit {

  constructor(
    private _httpClient: HttpClient,
    private dataService: DataService,
    private confirmDialog: ConfirmDialog,
    private errorAlert: ErrorAlert
  ) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {

    this.loadMyData();

    this.isLoadingPublic = true;
    this.dataDB.getDataPublic().subscribe(data => {
      this.isLoadingPublic = false;
      this.openData = data;
    }, err => this.errorAlert.open(err));

  }

  loadMyData() {
    this.isLoadingMy = true;
    this.dataDB.getDataMy().subscribe(data => {
      this.isLoadingMy = false;
      this.openData = data;
    }, err => this.errorAlert.open(err));
  }

  dataDB: DataDatabase = new DataDatabase(this._httpClient);
  openData: DataInfo[] = [];
  myData: DataInfo[] = [];

  files: FileList|null = null;

  isLoadingMy = true;
  isLoadingPublic = true;

  addData() {
    if (!this.files?.length)
      return;
    this.dataService.uploadData(this.files[0]).subscribe(msg => {
      this.confirmDialog.open(msg);
      this.loadMyData();
    }, err => this.errorAlert.open(err));
  }

  /*onFileSelected(event: InputEvent) {
    const files = event.target.files;
    if (!files)
      return;
    const file: File = files[0];
    
  }*/
}

/*interface InputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
*/
