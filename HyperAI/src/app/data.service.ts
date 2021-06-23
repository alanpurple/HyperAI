import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of as observableOf } from 'rxjs';

import { DataInfo } from './data.info';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
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
