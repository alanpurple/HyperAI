import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserData } from './user.data';

@Injectable()
export class NotLoggedIn implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.http.get('/account/notLoggedIn', { responseType: 'text' })
      .pipe(
        map(res => true)
        , catchError(err => {
          if (err.status == 400)
            return throwError('logged in');
          else
            return throwError(err);
        }));
  }
}

@Injectable()
export class LoggedIn implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.http.get<UserData>('/account/info')
      .pipe(
        map(res => {
          if (!res.nickName) {
            this.router.navigate(['/user-info']);
            return false;
          }
          else
            return true;
        }),
        catchError(err => {
          if (err.status != 401) {
            console.error(err._body);
            return throwError(err);
          }
          else {
            return this.router.navigate(['/login']);
          }
        })
      )
  }
}

@Injectable()
export class IsAdmin implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.http.get('/account/admin', { responseType: 'text' })
      .pipe(
        map(res => true),
        catchError(err => throwError(err)))
  }
}

@Injectable()
export class IsNotAdmin implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.http.get('/account/notadmin', { responseType: 'text' })
      .pipe(
        map(res => true),
        catchError(err => throwError(err)))
  }
}

@Injectable()
export class HasNick implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.http.get('/account/hasNoNick', { responseType: 'text' })
      .pipe(
        map(res => {
          switch (res) {
            case 'notloggedin':
            case 'hasnick':
              return true;
            case 'hasnonick':
              this.router.navigate(['/user-info']);
              return false;
            default:
              throwError('unexpected string');
              return false;
          }
        })
        , catchError(err => throwError(err)));
  }
}
