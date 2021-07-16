import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of as observableOf } from 'rxjs';

import { DataInfo } from './data.info';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  getDataPublic(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data/public');
  }

  getDataMy(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data');
  }

  // upload pulic data, for admin only
  uploadDataPublic(data: File): Observable<DataInfo> {
    return this._httpClient.post<DataInfo>('/data/public', { file: data });
  }

  uploadData(data: File): Observable<DataInfo> {
    return this._httpClient.post<DataInfo>('/data', { file: data });
  }
}

export class DataDatabase {
  constructor(private _httpClient: HttpClient) { }

  getDataPublic(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data/public');
  }

  getDataMy(): Observable<DataInfo[]> {
    return this._httpClient.get<DataInfo[]>('/data');
  }
}
