import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

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

  private readonly DEFAULT_UFOS = '1';
  private readonly DEFAULT_TIME = '60';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPreferences();
  }

  savePreferences(): void {
    localStorage.setItem('numberOfUFOs', this.numberOfUFOs);
    localStorage.setItem('timeLimit', this.timeLimit);
    alert('Preferences saved successfully!');
    this.router.navigateByUrl("/play");
  }

  loadPreferences(): void {
    this.numberOfUFOs = localStorage.getItem('numberOfUFOs') || this.DEFAULT_UFOS;
    this.timeLimit = localStorage.getItem('timeLimit') || this.DEFAULT_TIME;
  }
}
