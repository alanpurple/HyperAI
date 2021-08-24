import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of as observableOf, throwError } from 'rxjs';

import { DataInfo, TableData, CompactData } from './data.info';

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

  getDataCompact(isOpen: boolean, name: string, attributes: string[]): Observable<CompactData> {
    if (!attributes || attributes.length < 2)
      return throwError('invalid request');
    else if (attributes.length > 3)
      return throwError('this api is for attributes of length less than 4');
    else
      return this._httpClient.get<CompactData>('data/compact/' + (isOpen ? 1 : 0) + '/' + name + '/' + attributes.join('/'));
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
