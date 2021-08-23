import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatModule } from './mat.module';

// not working ( hopefully only for now )
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;

/*import { PlotlyViaCDNModule } from 'angular-plotly.js';
PlotlyViaCDNModule.setPlotlyVersion('latest');
PlotlyViaCDNModule.setPlotlyBundle('basic');*/

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

/*import { DataService } from './data.service';
import { EdaService } from './eda.service';
import { ReportService } from './report.service';
import { TrainService } from './train.service';
import { UserService } from './user.service';*/

import { LoggedIn, NotLoggedIn, HasNick, IsAdmin, IsNotAdmin } from './check.login';
import { ErrorAlert, ErrorDialog } from './error.alert';
import { ConfirmDialog, ConfirmDialogTemplate,ConfirmDialogTemplate2 } from './confirm.dialog';
import { UserInfo, ComingSoonDialog, NickNameConfirmDialog, NickNameTakenDialog } from './user.info';

@NgModule({
  declarations: [
    AppComponent, SignupComponent, LoginComponent, HomeComponent,
    AdminComponent,InfoComponent,DescComponent,TrainComponent,
    DataComponent, ModelComponent, EdaComponent,
    ErrorDialog, ConfirmDialogTemplate, ConfirmDialogTemplate2, UserInfo,
    ComingSoonDialog, NickNameTakenDialog, NickNameConfirmDialog
  ],
  entryComponents: [
    ConfirmDialogTemplate, ConfirmDialogTemplate2, ErrorDialog, ComingSoonDialog,
    NickNameConfirmDialog, NickNameTakenDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    PlotlyModule,
    //PlotlyViaCDNModule,
    MatModule
  ],
  providers: [ConfirmDialog, LoggedIn, NotLoggedIn, IsAdmin, IsNotAdmin, ErrorAlert, HasNick,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }],
  bootstrap: [AppComponent]
})
export class AppModule { }
