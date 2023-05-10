import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatLineModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";

@Component({
    templateUrl: './privacy-policy.html',
    styleUrls: ['./privacy-policy.sass'],
    standalone: true,
    imports: [MatCardModule, MatListModule, MatIconModule, MatLineModule, MatButtonModule]
})
export class PrivacyPolicy {

}
