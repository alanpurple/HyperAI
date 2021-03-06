import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LrRequestData, LrResponseData } from './lr.data';


@Injectable({
  providedIn: 'root'
})
export class LrService {
  constructor(private http: HttpClient) { }

  elasticnetcv(data: LrRequestData): Observable<LrResponseData> {
    return this.http.post<LrResponseData>('/lr/elasticnetcv', data);
  }
}
