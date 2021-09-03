import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SummaryData } from './summary.data';

@Injectable({
  providedIn: 'root'
})
export class EdaService {

  constructor(private http: HttpClient) { }

  cleanse(data: string): Observable<PreprocessResponse> {
    return this.http.get<PreprocessResponse>('/eda/cleanse/' + data);
  }

  normLog(data: string): Observable<PreprocessResponse> {
    return this.http.get<PreprocessResponse>('/eda/normlog/' + data);
  }

  describe(isOpen: boolean, data: string): Observable<SummaryData[]> {
    return this.http.get<SummaryData[]>('/eda/describe/' + (isOpen ? 1 : 0) + '/' + data);
  }

  getAssociation(isOpen: boolean, name: string, source: string, target: string, type: number): Observable<any> {
    return this.http.get('/eda/relation/' + (isOpen ? '1' : '0') + '/' + name + '/' + source + '/' + target + '/' + type.toString());
  }
}

interface PreprocessResponse {
  msg: string[];
  table: string;
}

export class SummaryDataSource {
  constructor(
    private edaService: EdaService
  ) { }

  getSummary(isOpen:boolean,name: string): Observable<SummaryData[]> {
    return this.edaService.describe(isOpen,name);
  }
}
