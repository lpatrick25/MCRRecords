import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-record',
    templateUrl: './record.page.html',
    styleUrls: ['./record.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class RecordPage {

    constructor(private router: Router) {}

    goToAddDocument() {
        this.router.navigate(['/certificate']);
    }

}
