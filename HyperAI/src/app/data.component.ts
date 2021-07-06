import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { DataInfo } from './data.info';
import { DataDatabase } from './data.service';
import { ErrorAlert } from './error.alert';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.sass']
})
export class DataComponent implements OnInit, AfterViewInit {

  constructor(
    private _httpClient: HttpClient,
    private errorAlert: ErrorAlert
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataDB = new DataDatabase(this._httpClient);
    this.isLoadingMy = true;
    this.dataDB.getDataMy().subscribe(data => {
      this.isLoadingMy = false;
      this.myData = data;
    }, err => this.errorAlert.open(err));

    this.isLoadingPublic = true;
    this.dataDB.getDataPublic().subscribe(data => {
      this.isLoadingPublic = false;
      this.openData = data;
    }, err => this.errorAlert.open(err));

  }

  @ViewChild(MatSort) sortMy!: MatSort;

  @ViewChild(MatSort) sortPublic!: MatSort;

  dataDB: DataDatabase | null = null;
  openData: DataInfo[] = [];
  myData: DataInfo[] = [];

  files: FileList|null = null;

  isLoadingMy = true;
  isLoadingPublic = true;

  addData() {

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
