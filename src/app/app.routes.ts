import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PlayComponent } from './components/play/play.component';
import { LoginComponent } from './components/login/login.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { RegisterComponent } from './components/register/register.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { RecordsComponent } from './components/records/records.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'play', component: PlayComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'records', component: RecordsComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: '**', redirectTo: 'register', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [provideHttpClient(withFetch())]
})
export class AppRoutingModule { }