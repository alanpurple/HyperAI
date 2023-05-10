import { OnInit, Component, Inject } from '@angular/core';
import { DOCUMENT, NgIf } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { UserData } from './user.data';
import { UserService } from './user.service';
import { ConfirmDialog } from './shared/confirm.dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FlexModule } from '@angular/flex-layout/flex';

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

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: true,
  imports: [FlexModule, NgIf, RouterLink, RouterOutlet,
    //Material Modules
    MatAutocompleteModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule,
    MatInputModule, MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatCardModule, MatDividerModule,
    MatExpansionModule, MatGridListModule, MatListModule, MatStepperModule, MatTabsModule,
    MatTreeModule, MatButtonModule, MatButtonToggleModule, MatBadgeModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatRippleModule,
    MatBottomSheetModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatPaginatorModule, MatSortModule, MatTableModule, MatNativeDateModule
    /////////////
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    private confirmDialog: ConfirmDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.iconRegistry.addSvgIcon('martinie',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/martinie.svg'));
    if (this.doc.documentElement.clientWidth < 800) {
      this.sidenavMode = 'over';
      this.isOpened = false;
    }
  }

  user: UserData | null = null;
  isAdmin: boolean = false;

  title = 'HyperAI';

  isOpened: boolean = true;
  sidenavMode: 'side' | 'over' | 'push' = 'side';
  msgs: string[] = [];

  handleMenu(sidemenu: MatSidenav) {
    if (this.doc.documentElement.clientWidth < 800)
      sidemenu.close();
  }

  userNoNick = false;

  ngOnInit() {
    this.userService.getUser()
      .subscribe({
        next: user => {
          if (!user.nickName) {
            this.userNoNick = true;
            this.router.navigate(['/user-info']);
            return;
          }
          this.user = user;
          if (user.accountType == 'admin')
            this.isAdmin = true;
        },
        error: error => {
          if (error.status != 401)
            console.error(error.error);
        }
      });
  }

  showAccountInfo() {
    if (!this.user)
      this.confirmDialog.open('untouchable code(user only menu but no user?), error');
    else
      this.confirmDialog.open([
        'email: ' + this.user.email,
        'name: ' + this.user.name,
        'nickname: ' + this.user.nickName
      ]);
  }
}
