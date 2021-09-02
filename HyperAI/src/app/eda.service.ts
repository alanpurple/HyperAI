import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { SummaryData } from './summary.data';

@Injectable({
  providedIn: 'root'
})
export class EdaService {

  constructor(private http: HttpClient) { }

  cleanse(data: string): Observable<string> {
    return this.http.get('/eda/cleanse/' + data, { responseType: 'text' });
  }

  normLog(data: string): Observable<string> {
    return this.http.get('/eda/normlog/' + data, { responseType: 'text' });
  }

  describe(isOpen: boolean, data: string): Observable<SummaryData[]> {
    const props = ['mean', 'std', 'min', 'q1', 'q2', 'q3', 'max'];
    return this.http.get<SummaryData[]>('/eda/describe/' + (isOpen ? 1 : 0) + '/' + data);
  }

  getAssociation(isOpen: boolean, name: string, source: string, target: string, type: number): Observable<any> {
    return this.http.get('/eda/relation/' + (isOpen ? '1' : '0') + '/' + name + '/' + source + '/' + target + '/' + type.toString());
  }
}

export class SummaryDataSource {
  constructor(
    private edaService: EdaService
  ) { }

  getSummary(isOpen:boolean,name: string): Observable<SummaryData[]> {
    return this.edaService.describe(isOpen,name);
  }
}
