import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent implements OnInit {
  topRecords: any[] = [];
  userRecords: any[] = [];
  isLoggedIn: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchTopRecords();
    this.checkLoginStatus();
    this.fetchUserRecords();
  }

  fetchTopRecords(): void {
    this.http.get<any[]>('http://wd.etsisi.upm.es:10000/records')
      .subscribe(
        (data) => {
          this.topRecords = data.slice(0, 10);
        },
        (error) => {
          console.error('Error fetching top records:', error);
        }
      );
  }

  recordsUrl: string = `${"http://wd.etsisi.upm.es:10000/records"}`;

  fetchUserRecords(): void {
    const user = localStorage.getItem('username');
    this.http.get<any>(`${this.recordsUrl}/${user}`).subscribe(
      (data) => {
        this.userRecords = data; // Assuming API returns user-specific records
      },
      (error) => {
        console.error('Error fetching user records:', error);
      }
    );
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    this.isLoggedIn = !!token && !!user;  // Set login status based on the existence of token and username
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}

