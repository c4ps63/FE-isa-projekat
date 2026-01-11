import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'jwt_token';
  
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData, { responseType: 'text' })
      .pipe(
        tap(token => {
          this.saveToken(token);
          this.loggedIn.next(true); 
        })
      );
  }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData, { responseType: 'text' });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn.next(false); 
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
  
  private hasToken(): boolean {
    return !!this.getToken();
  }
}
