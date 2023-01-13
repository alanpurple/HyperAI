import { OnInit, Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

import { UserData } from './user.data';
import { UserService } from './user.service';
import { ConfirmDialog } from './shared/confirm.dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
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

  ngOnInit() {
    this.userService.getUser()
      .subscribe(
        user => {
          if (!user.nickName) {
            this.router.navigate(['/user-info']);
            return;
          }
          this.user = user;
          if (user.accountType == 'admin')
            this.isAdmin = true;
        },
        error => {
          if (error.status != 401)
            console.error(error.error);
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
