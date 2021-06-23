import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatModule } from './mat.module';

import * as PlotlyJS from 'plotly.js-dist';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './signup.component';
import { LoginComponent } from './login.component';
import { HomeComponent } from './home.component';
import { AdminComponent } from './admin.component';
import { InfoComponent } from './info.component';
import { DescComponent } from './desc.component';
import { TrainComponent } from './train.component';
import { DataComponent } from './data.component';
import { ModelComponent } from './model.component';
import { EdaComponent } from './eda.component';

import { DataService } from './data.service';
import { EdaService } from './eda.service';
import { ReportService } from './report.service';
import { TrainService } from './train.service';

import { LoggedIn, NotLoggedIn, HasNick, IsAdmin } from './check.login';
import { ErrorAlert, ErrorDialog } from './error.alert';
import { ConfirmDialog, ConfirmDialogTemplate } from './confirm.dialog';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent, SignupComponent, LoginComponent, HomeComponent,
    AdminComponent,InfoComponent,DescComponent,TrainComponent,
    DataComponent, ModelComponent, EdaComponent,
    ErrorDialog, ConfirmDialogTemplate
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    PlotlyModule,
    MatModule
  ],
  providers: [ConfirmDialog, LoggedIn, NotLoggedIn, IsAdmin, ErrorAlert, HasNick,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }],
  bootstrap: [AppComponent]
})
export class AppModule { }
