import { enableProdMode, ErrorHandler, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { GojsAngularModule } from 'gojs-angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PlotlyModule } from 'angular-plotly.js';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { MyErrorHandler } from './app/my.error.handler';
import { DeleteConfirmDialog } from './app/shared/delete.confirm.dialog';
import { ErrorAlert } from './app/shared/error.alert';
import { ConfirmDialog } from './app/shared/confirm.dialog';

/////////////////////////
// Material Modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// Material Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
// Material Layout
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
// Material Popups & Modals
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

////////////////////////

const config: SocketIoConfig = { url: 'https://martinie.ai' };



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
    importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule, FlexLayoutModule, PlotlyModule, NgxChartsModule, GojsAngularModule, SocketIoModule.forRoot(config),
      //Material Modules
      MatAutocompleteModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule,
      MatInputModule, MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
      MatMenuModule, MatSidenavModule, MatToolbarModule, MatCardModule, MatDividerModule,
      MatExpansionModule, MatGridListModule, MatListModule, MatStepperModule, MatTabsModule,
      MatTreeModule, MatButtonModule, MatButtonToggleModule, MatBadgeModule, MatChipsModule,
      MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatRippleModule,
      MatBottomSheetModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
      MatPaginatorModule, MatSortModule, MatTableModule, MatNativeDateModule,
      /////////////
    ),
        ConfirmDialog, ErrorAlert, DeleteConfirmDialog,
        { provide: ErrorHandler, useClass: MyErrorHandler },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
