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

  login(username: string, password: string): Observable<string> {
    return this.http.post('/account/login', { username: username, password: password }, { responseType: 'text' });
  }

  getUser(): Observable<UserData> {
    return this.http.get<UserData>('/account/info');
  }

  checkuser(email: string): Observable<string> {
    return this.http.get('/account/checkUser/'
      + encodeURI(email), { responseType: 'text' });
  }

  getOrganizations(): Observable<string[]> {
    return this.http.get<string[]>('/account/all-organization');
  }

  updateUser(data: {}): Observable<string> {
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

  getColleagues(): Observable<string[]> {
    return this.http.get<string[]>('/account/colleagues');
  }
}
