import { Component, inject, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterOutlet, RouterModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  router = inject(Router);
  http = inject(HttpClient);

  constructor(private injector: Injector) {
  }


  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  }
}