import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RouterOutlet],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})

export class PreferencesComponent implements OnInit {
  numberOfUFOs: string = '1';
  timeLimit: string = '60';
  ufoOptions: string[] = ['1', '2', '3', '4', '5'];
  timeOptions: string[] = ['60', '120', '180'];
  isLoggedIn = false;

  private readonly DEFAULT_UFOS = '1';
  private readonly DEFAULT_TIME = '60';
  private readonly SERVER_URL = 'http://localhost:3000/preferences';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.loadPreferences();
  }

  savePreferences(): void { // Saves preferences locally and plays the game with those preferences
    localStorage.setItem('numberOfUFOs', this.numberOfUFOs);
    localStorage.setItem('timeLimit', this.timeLimit);
    alert('Preferences saved successfully!');
    this.router.navigateByUrl('/play');
  }

  loadPreferences(): void {
    this.numberOfUFOs = localStorage.getItem('numberOfUFOs') || this.DEFAULT_UFOS;
    this.timeLimit = localStorage.getItem('timeLimit') || this.DEFAULT_TIME;
  }

  saveToServer(): void { // Only saves the preferences to the server. 
    const preferences = { // If the game is played through the navbar still loads localStorage preferances.
      username: this.authService.getUsername(),
      ufos: parseInt(this.numberOfUFOs, 10),
      time: parseInt(this.timeLimit, 10),
    };

    this.http.post(this.SERVER_URL, preferences).subscribe(
      (response) => {
        alert('Preferences saved to server successfully!');
      },
      (error) => {
        console.error('Error saving to server:', error);
        alert('Failed to save preferences to server.');
      }
    );
  }

  getFromServer(): void { // Loads preferences prom server and starts the game with them.
    const username = this.authService.getUsername();
  
    this.http.get<{ ufos: number; time: number }>(`http://localhost:3000/preferences/${username}`).subscribe(
      (response) => {
        if (response) {
          alert('Preferences loaded from server!');
          this.router.navigate(['/play'], {
            queryParams: { ufos: response.ufos, time: response.time },
          });
        } else {
          alert('No preferences found on the server. Using local values.');
          this.router.navigate(['/play']);
        }
      },
      (error) => {
        console.error('Error fetching preferences from server:', error);
        alert('Failed to fetch preferences from server. Using local values.');
        this.router.navigate(['/play']);
      }
    );
  }
}
