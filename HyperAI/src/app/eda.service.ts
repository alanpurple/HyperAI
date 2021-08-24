import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  describe(data: string): Observable<SummaryData[]> {
    return this.http.get<SummaryData[]>('/eda/describe/' + data);
  }

  getAssociation(isOpen: boolean, name: string, source: string, target: string, type: number): Observable<any> {
    return this.http.get('/eda/relation/' + isOpen ? '1' : '0' + '/' + name + '/' + source + '/' + target + '/' + type.toString());
  }
}

export class SummaryDataSource {
  constructor(
    private edaService: EdaService
  ) { }

  getSummary(name: string): Observable<SummaryData[]> {
    return this.edaService.describe(name);
  }
}
