import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  constructor(private router: Router) {}

  get isLoggedIn$() {
    return this.loggedIn.asObservable();
  }

  setLoginStatus(isLoggedIn: boolean): void {
    this.loggedIn.next(isLoggedIn);
  }

  setUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  autoLogout(): void {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (!expirationTime) return;

    const timeout = parseInt(expirationTime, 10) - new Date().getTime();
    if (timeout > 0) {
      setTimeout(() => {
        this.logout();
      }, timeout);
    } else {
      this.logout();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');
    this.setLoginStatus(false);
    this.router.navigateByUrl('/login');
    alert('Session expired. Please log in again.');
  }
}
