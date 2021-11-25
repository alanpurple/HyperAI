import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotLoggedIn, HasNick, IsAdmin, LoggedIn, IsNotAdmin } from './check.login';

import { AdminConsole } from './admin.console';
import { DataComponent } from './data.component';
import { DescComponent } from './desc.component';
import { Association } from './association';
import { HomeComponent } from './home.component';
import { InfoComponent } from './info.component';
import { LoginComponent } from './login.component';
import { SignupComponent } from './signup.component';
import { ModelComponent } from './model.component';
import { TrainComponent } from './train.component';
import { EdaComponent } from './eda.component';
import { UserInfo } from './user.info';
import { ProjectComponent } from './project.component';
import { ProjectDetailComponent } from './project-detail.component';
import { PrivacyPolicy } from './privacy-policy';

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
    canActivate: [NotLoggedIn]
  },
  {
    path: 'signup', component: SignupComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'signup/:id', component: SignupComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'admin-console', component: AdminConsole,
    canActivate: [IsAdmin]
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
  },
  {
    path: 'association', component: Association,
    canActivate: [LoggedIn]
  },
  {
    path: 'model-suggestion', component: ModelComponent,
    canActivate: [LoggedIn]
  },
  {
    path: 'train-manager', component: TrainComponent,
    canActivate: [LoggedIn]
  },
  {
    path: 'eda-manager', component: EdaComponent,
    canActivate: [LoggedIn, IsNotAdmin]
  }, {
    path: 'user-info', component: UserInfo,
    canActivate: [LoggedIn]
  }, {
    path: 'project-manager', component: ProjectComponent,
    canActivate: [LoggedIn, IsNotAdmin]
  }, {
    path: 'project-manager/:id', component: ProjectDetailComponent,
    canActivate: [LoggedIn, IsNotAdmin]
  }, {
    path: 'project-manager/:id/auto', component: ProjectDetailComponent,
    canActivate: [LoggedIn, IsNotAdmin]
  }, {
    path: 'privacy-policy', component: PrivacyPolicy
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
