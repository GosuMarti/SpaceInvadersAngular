import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'http://wd.etsisi.upm.es:10000';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {}

  // Register a new user
  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post(`${this.apiUrl}/users`, body);
  }

  // Login and get the JWT token
  login(username: string, password: string): Observable<any> {
    const body = `username=${username}&password=${password}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(`${this.apiUrl}/users/login`, body, { headers, observe: 'response' });
  }

  // Save the JWT token to local storage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get the JWT token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove the JWT token (logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}