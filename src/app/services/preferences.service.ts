import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private baseUrl = 'http://localhost:3000/preferences';

  constructor(private http: HttpClient) {}

  getPreferences(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${username}`);
  }

  updatePreferences(username: string, ufos: number, time: number): Observable<any> {
    return this.http.post(this.baseUrl, { username, ufos, time });
  }
}
