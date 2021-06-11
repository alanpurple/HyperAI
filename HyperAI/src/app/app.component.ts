import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {

  }

  title = 'HyperAI';

  isOpened: boolean = true;
  sidenavMode: 'side' | 'over' | 'push' = 'side';
  msgs: string[] = [];
}
