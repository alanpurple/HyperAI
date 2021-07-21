import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserData } from './user.data';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUser(): Observable<UserData> {
    return this.http.get<UserData>('/account/info');
  }

  checkuser(email: string): Observable<string> {
    return this.http.get('/account/checkUser/'
      + encodeURI(email), { responseType: 'text' });
  }

  saveUser(data: {}): Observable<string> {
    return this.http.put('/account', data, { responseType: 'text' });
  }

  checkNick(nick: string): Observable<boolean> {
    return this.http.get('/account/checkNickName/' + nick, { responseType: 'text' })
      .pipe(
        map(str => {
          switch (str) {
            case 'DUPLICATE':
              return false;
            case 'AVAILABLE':
              return true;
            default:
              throw Error('unacknowledgeable string received');
          }
        }));
  }
}
