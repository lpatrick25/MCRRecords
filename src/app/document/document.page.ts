import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RecordsService } from '../services/records.service';
import { RouterModule } from '@angular/router';
import { DocumentModalComponent } from '../document-modal/document-modal.component';

@Component({
    selector: 'app-document',
    templateUrl: './document.page.html',
    styleUrls: ['./document.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DocumentPage implements OnInit {
    public documents: any[] = [];
    public filteredDocuments: any[] = [];
    public searchText: string = ''; // This will hold the search query

    constructor(
        private recordsService: RecordsService,
        private modalController: ModalController
    ) { }

    async ngOnInit() {
        try {
            const docs = await this.recordsService.getAllDocuments();
            this.documents = docs ?? []; // Fallback to empty array if undefined
            this.filteredDocuments = this.documents; // Initialize filteredDocuments with all documents
        } catch (error) {
            console.error('Failed to load documents:', error);
            this.documents = []; // Ensure documents is always an array
            this.filteredDocuments = []; // Ensure filteredDocuments is always an array
        }
    }

    formatText(input: string): string {
        if (!input) return '';
        // Replace underscores with spaces and capitalize the first letter of each word
        return input.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    getFullName(doc: any): string {
        const { first_name, middle_name, last_name, suffix } = doc;
        return `${first_name} ${middle_name ?? ''} ${last_name} ${suffix ?? ''}`.trim();
    }

    async openDocumentModal(doc: any) {
        const modal = await this.modalController.create({
            component: DocumentModalComponent,
            componentProps: { document: doc },
        });

        await modal.present();
    }

    // This method filters the documents based on the search text
    filterDocuments() {
        const searchTextLower = this.searchText.toLowerCase();
        this.filteredDocuments = this.documents.filter(doc => {
            const fullName = this.getFullName(doc).toLowerCase();
            const documentType = doc.document_type.toLowerCase();
            return fullName.includes(searchTextLower) || documentType.includes(searchTextLower);
        });
    }
}
