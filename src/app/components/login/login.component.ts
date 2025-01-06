import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, RouterOutlet, HttpClientModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  loginObj: any = {
    username:'',
    password:''
  };

  apiLoginObj: any = {
    "username": "",
    "password": ""
  };

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onLogin() {
    const params = {
      username: this.apiLoginObj.username,
      password: this.apiLoginObj.password
    };

    this.http.get("http://wd.etsisi.upm.es:10000/users/login", { params, observe: 'response' }).subscribe(
      (response: any) => {
        const token = response.headers.get('Authorization');
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("username", this.apiLoginObj.username);
          this.authService.setLoginStatus(true);
          alert('Login successful!');
          this.router.navigateByUrl('/records');
        } else {
          alert('Login successful but no token received.');
        }
      },
      error => {
        alert("Wrong credentials");
      }
    );
  }
}

// onSubmit(): void {
//   this.authService.login(this.username, this.password).subscribe(
//     response => {
//       const token = response.headers.get('Authorization');
//       if (token) {
//         this.authService.saveToken(token);
//         alert('Login successful!');
//         this.router.navigate(['/home']); // Redirect to home or any other page
//       }
//     },
//     error => {
//       alert('Login failed: ' + error.message);
//     }
//   );
// }

