import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
    selector: 'app-document-modal',
    templateUrl: './document-modal.component.html',
    styleUrls: ['./document-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DocumentModalComponent {
    @Input() document: any; // Input to receive the document details

    constructor(private modalController: ModalController) { }

    dismiss() {
        this.modalController.dismiss();
    }
}
