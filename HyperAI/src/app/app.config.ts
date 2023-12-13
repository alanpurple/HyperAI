import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';


import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GojsAngularModule } from 'gojs-angular';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'https://martinie.ai' };

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

import { MyErrorHandler } from './my.error.handler';
import { ConfirmDialog } from './shared/confirm.dialog';
import { ErrorAlert } from './shared/error.alert';
import { DeleteConfirmDialog } from './shared/delete.confirm.dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

////////////////////////

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideAnimations(),
    importProvidersFrom(
      FlexLayoutModule,
      PlotlyModule,
      NgxChartsModule,
      GojsAngularModule,
      SocketIoModule.forRoot(config)
    ), ConfirmDialog, ErrorAlert, DeleteConfirmDialog,
    { provide: ErrorHandler, useClass: MyErrorHandler },
    provideHttpClient(withInterceptorsFromDi())
  ]
}
