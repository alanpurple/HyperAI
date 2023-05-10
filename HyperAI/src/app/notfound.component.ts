import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
    styleUrls: ['./notfound.component.sass'],
    standalone: true,
    imports: [MatCardModule, MatIconModule, MatButtonModule]
})
export class NotfoundComponent{

  constructor(private router: Router) { }

  returnToHome() {
    this.router.navigate(['/']);
  }
}
