import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotLoggedIn, HasNick, IsAdmin, LoggedIn } from './check.login';

import { AdminComponent } from './admin.component';
import { DataComponent } from './data.component';
import { DescComponent } from './desc.component';
import { HomeComponent } from './home.component';
import { InfoComponent } from './info.component';
import { LoginComponent } from './login.component';
import { SignupComponent } from './signup.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'login', component: LoginComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'login/:id', component: LoginComponent,
    canActivate: [NotLoggedIn],
    canDeactivate: [LoggedIn]
  },
  {
    path: 'signup', component: SignupComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'info', component: InfoComponent
  },
  {
    path: 'description', component: DescComponent,
    canActivate: [LoggedIn]
  },
  {
    path: 'data-manager', component: DataComponent,
    canActivate: [LoggedIn]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
