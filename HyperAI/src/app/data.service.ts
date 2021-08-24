import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of as observableOf } from 'rxjs';

import { DataInfo, TableData } from './data.info';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  getDataPublic(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data/open');
  }

  getDataMy(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data');
  }

  getTable(name: string): Observable<TableData> {
    return this._httpClient.get<TableData>('/data/' + name);
  }

  uploadData(data: File): Observable<DataInfo> {
    let formData = new FormData();
    formData.append('data', data);
    return this._httpClient.post<DataInfo>('/data', formData);
  }
}

export class DataDatabase {
  constructor(private _httpClient: HttpClient) { }

  getDataPublic(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data/open');
  }

  getDataMy(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data');
  }
}
