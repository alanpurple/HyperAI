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
    return this.http.get<SummaryData[]>('/eda/describe/' + (isOpen ? 1 : 0) + '/' + data).pipe(
      map((result: SummaryData[]) => {
        for (let i = 0; i < result.length; i++) {
          let elem: SummaryData = result[i];
          if (elem.type == 'numeric') {
            //if (elem.mean * 10000 % 1 > 0)
              result[i].mean = parseFloat(elem.mean.toPrecision(5))
            //if (elem.std * 10000 % 1 > 0)
              result[i].std = parseFloat(elem.std.toPrecision(5))
            //if (elem.min * 10000 % 1 > 0)
              result[i].min = parseFloat(elem.min.toPrecision(5))
            //if (elem.q1 * 10000 % 1 > 0)
              result[i].q1 = parseFloat(elem.q1.toPrecision(5))
            //if (elem.q2 * 10000 % 1 > 0)
              result[i].q2 = parseFloat(elem.q2.toPrecision(5))
            //if (elem.q3 * 10000 % 1 > 0)
              result[i].q3 = parseFloat(elem.q3.toPrecision(5))
            //if (elem.max * 10000 % 1 > 0)
              result[i].max = parseFloat(elem.max.toPrecision(5))
          }
        }
        return result;
      })
    );
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
