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
          const currentTime = new Date().getTime();
          const expirationTime = currentTime + 10 * 60 * 1000;
          localStorage.setItem("token", token);
          localStorage.setItem("tokenExpiration", expirationTime.toString());
          localStorage.setItem("username", this.apiLoginObj.username);
          this.authService.setLoginStatus(true);
          this.authService.autoLogout();
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

