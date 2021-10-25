import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';

import { DataInfo } from './data.info';
import { DataDatabase, DataService } from './data.service';
import { UserService } from './user.service';
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
    private userService: UserService,
    private confirmDialog: ConfirmDialog,
    private errorAlert: ErrorAlert
  ) { }

  displayedColumns: string[] = ['name', 'type', 'numRows'];
  isAdmin: boolean = false;

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => { this.isAdmin = user.accountType == 'admin' },
      err => this.errorAlert.open(err));
  }

  ngAfterViewInit() {
    this.dataDB = new DataDatabase(this._httpClient);
    this.loadOpen();
    this.loadMy();
  }

  loadOpen() {
    if (!this.dataDB)
      return;
    this.isLoadingPublic = true;
    this.dataDB.getDataPublic().subscribe(data => {
      this.isLoadingPublic = false;
      this.openData = data;
    }, err => this.errorAlert.open(err));
  }

  loadMy() {
    if (!this.dataDB)
      return;
    this.isLoadingMy = true;
    this.dataDB.getDataMy().subscribe(data => {
      this.isLoadingMy = false;
      this.myData = data;
    }, err => this.errorAlert.open(err));
  }

  dataDB: DataDatabase | null = null;
  openData: DataInfo[] = [];
  myData: DataInfo[] = [];

  file: File | null = null;
  fileOpen: File | null = null;

  isLoadingMy = true;
  isLoadingPublic = true;

  addData() {
    if (!this.file)
      return;
    this.uploading = true;
    this.dataService.uploadData(this.file).subscribe(data => {
      this.uploading = false;
      this.file = null;
      this.loadMy();
      this.confirmDialog.open('data uplodaed');
    }, err => this.errorAlert.open(err));
  }

  uploading: boolean = false;

  addOpenData() {
    if (!this.fileOpen)
      return;
    this.uploading = true;
    this.dataService.uploadData(this.fileOpen).subscribe(data => {
      this.uploading = false;
      this.file = null;
      this.loadOpen();
      this.confirmDialog.open('open data added');
    }, err => this.errorAlert.open(err));
  }

  onFileSelected(event: Event) {
    if (!event.target)
      return;
    if (!('files' in event.target))
      return;
    const files = event.target['files'];
    if (!files)
      this.file = null;
    else
      this.file = files[0];
    
  }

  onFileSelectedOpen(event: Event) {
    if (!event.target)
      return;
    if (!('files' in event.target))
      return;
    const files = event.target['files'];
    if (!files)
      this.fileOpen = null;
    else
      this.fileOpen = files[0];

  }
}
