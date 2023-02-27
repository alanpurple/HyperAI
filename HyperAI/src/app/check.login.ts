import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserData } from './user.data';

export const LoggedIn: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  return http.get<UserData>('/account/info')
    .pipe(
      map(res => {
        if (!res.nickName && state.url != '/user-info') {
          router.navigate(['/user-info']);
          return false;
        }
        else
          return true;
      }),
      catchError(err => {
        if (err.status != 401) {
          console.error(err._body);
          return throwError(() => err);
        }
        else {
          return router.navigate(['/login']);
        }
      })
    );
}

export const NotLoggedIn: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const http = inject(HttpClient);

  return http.get('/account/notLoggedIn', { responseType: 'text' })
    .pipe(
      map(res => true)
      , catchError(err => {
        if (err.status == 400)
          return of(false);
        else
          return throwError(()=>err);
      }));
}

export const CanActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  return http.get<UserData>('/account/info')
    .pipe(
      map(res => {
        if (!res.nickName && state.url != '/user-info') {
          router.navigate(['/user-info']);
          return false;
        }
        else
          return true;
      }),
      catchError(err => {
        if (err.status != 401) {
          console.error(err._body);
          return throwError(() => err);
        }
        else {
          return router.navigate(['/login']);
        }
      })
    );
}

export const IsAdmin: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const http = inject(HttpClient);

  return http.get('/account/admin', { responseType: 'text' })
    .pipe(
      map(res => true),
      catchError(err => {
        if (err.status != 401) {
          console.error(err._body);
          return throwError(()=>err);
        }
        return of(false);
      }))
}

export const IsNotAdmin: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const http = inject(HttpClient);

  return http.get('/account/notadmin', { responseType: 'text' })
    .pipe(
      map(res => true),
      catchError(err => {
        if (err.status != 401) {
          console.error(err._body);
          return throwError(()=>err);
        }
        return of(false);
      }))
}

export const HasNick: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  return http.get('/account/hasNoNick', { responseType: 'text' })
    .pipe(
      map(res => {
        switch (res) {
          case 'notloggedin':
          case 'hasnick':
            return true;
          case 'hasnonick':
            router.navigate(['/user-info']);
            return false;
          default:
            throwError(()=>'unexpected string');
            return false;
        }
      })
      , catchError(err => throwError(()=>err)));
}
