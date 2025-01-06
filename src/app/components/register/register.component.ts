import { Component, inject, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, CommonModule], // add routerOutlet import if error with rerouting
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  usernameTaken: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  checkUsername(): void {
    if (this.username.trim()) {
      this.http.get(`http://wd.etsisi.upm.es:10000/users/${this.username}`).subscribe(
        () => {
          this.usernameTaken = true; // Username exists
        },
        error => {
          if (error.status === 404) {
            this.usernameTaken = false; // Username does not exist
          } else {
            console.error('Error checking username:', error);
          }
        }
      );
    }
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const registerData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post('http://wd.etsisi.upm.es:10000/users', registerData).subscribe(
      response => {
        alert('Registration successful!');
        this.router.navigateByUrl('/login');
      },
      error => {
        alert('Registration failed. Please try again.');
        console.error('Error during registration:', error);
      }
    );
  }
}