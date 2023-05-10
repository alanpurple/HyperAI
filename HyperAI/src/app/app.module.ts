import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GojsAngularModule } from 'gojs-angular';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'https://martinie.ai' };

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './signup.component';
import { LoginComponent, NoEmailDialog } from './login.component';
import { HomeComponent } from './home.component';
import { AdminConsole } from './admin.console';
import { InfoComponent } from './info.component';
import { DescComponent } from './desc.component';
import { TrainComponent } from './train.component';
import { DataComponent } from './data.component';
import { EdaComponent } from './eda.component';
import { Association } from './association';
import { DataPreview } from './data-preview';
import { ProjectComponent } from './project.component';
import { ProjectDetailComponent } from './project-detail.component';
import { PrivacyPolicy } from './privacy-policy';

import { ProjectDialog } from './project.dialog';
import { StructuralTaskDialog, TextTaskDialog, VisionTaskDialog } from './task.dialog';
import { DataDialog } from './data.dialog';

/*import { DataService } from './data.service';
import { EdaService } from './eda.service';
import { ReportService } from './report.service';
import { TrainService } from './train.service';
import { UserService } from './user.service';*/

import { ErrorAlert, ErrorDialog } from './shared/error.alert';
import { ConfirmDialog, ConfirmDialogTemplate, ConfirmDialogTemplate2 } from './shared/confirm.dialog';
import { DeleteConfirmDialog } from './shared/delete.confirm.dialog';
import { UserInfo, ComingSoonDialog, NickNameConfirmDialog, NickNameTakenDialog } from './user.info';

import { ForbiddenValidatorDirective } from './shared/forbidden-name.directive';
import { NotfoundComponent } from './notfound.component';
import { MyErrorHandler } from './my.error.handler';
import { UserDialog } from './user.dialog';

@NgModule(/* TODO(standalone-migration): clean up removed NgModule class manually. 
{
    declarations: [AppComponent],
    /*entryComponents: [
      ConfirmDialogTemplate, ConfirmDialogTemplate2, ErrorDialog, ComingSoonDialog,
      NickNameConfirmDialog, NickNameTakenDialog,
      ProjectDialog, VisionTaskDialog, TextTaskDialog, StructuralTaskDialog, DataDialog,
      DeleteConfirmDialog
    ],*/
    imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    PlotlyModule,
    NgxChartsModule,
    GojsAngularModule,
    SocketIoModule.forRoot(config),
    SignupComponent, LoginComponent, HomeComponent,
    AdminConsole, InfoComponent, DescComponent, TrainComponent,
    DataComponent, EdaComponent, Association, DataPreview,
    ErrorDialog, ConfirmDialogTemplate, ConfirmDialogTemplate2, UserInfo,
    ComingSoonDialog, NickNameTakenDialog, NickNameConfirmDialog, ProjectComponent, ProjectDetailComponent,
    ProjectDialog, VisionTaskDialog, TextTaskDialog, StructuralTaskDialog, DataDialog,
    ForbiddenValidatorDirective, DeleteConfirmDialog, PrivacyPolicy, NotfoundComponent,
    UserDialog, NoEmailDialog
],
    providers: [ConfirmDialog, ErrorAlert, DeleteConfirmDialog,
        { provide: ErrorHandler, useClass: MyErrorHandler }],
    bootstrap: [AppComponent]
} */)
export class AppModule { }
