import { OnInit,Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

import { UserData } from './user.data';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService
  ) {

  }

  user: UserData|null = null;

  title = 'HyperAI';

  isOpened: boolean = true;
  sidenavMode: 'side' | 'over' | 'push' = 'side';
  msgs: string[] = [];

  handleMenu(sidemenu: MatSidenav) {
    if (window.outerWidth < 800)
      sidemenu.close();
  }

  ngOnInit() {
    this.userService.getUser()
      .subscribe(
        user => {
          this.user = user;
          if (!user.nickName)
            this.router.navigate(['/user-info']);
        },
        error => {
          if (error.status != 401)
            console.error(error._body);
        });
  }
}
