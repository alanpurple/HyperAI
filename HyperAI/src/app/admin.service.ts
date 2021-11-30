import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserData } from "./user.data";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserData[]> {
    return this.http.get<UserData[]>('/admin/user');
  }

  editUser(email: string, modification: any): Observable<string>{
    return this.http.put('/admin/user/' + email, modification, { responseType: 'text' });
  }

  deleteUser(email: string): Observable<string> {
    return this.http.delete('/admin/user/' + email, { responseType: 'text' });
  }
}
