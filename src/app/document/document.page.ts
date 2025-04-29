import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RecordsService } from '../services/records.service';
import { RouterModule } from '@angular/router';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
// @ts-ignore
import UTIF from 'utif';

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
    public isLoading: boolean = false;
    public currentPage: number = 1;  // <-- ADD
    public lastPage: number = 1;     // <-- ADD
    public isLoadingMore: boolean = false; // <-- ADD
    public tiffImageUrl: string = '';

    constructor(
        private recordsService: RecordsService,
        private modalController: ModalController
    ) { }

    async ngOnInit() {
        this.isLoading = true;
        try {
            const response = await this.recordsService.getDocumentsByPage(this.currentPage);
            this.documents = response.data.data ?? [];
            this.filteredDocuments = [...this.documents];
            this.lastPage = response.data.last_page ?? 1;

            // Process TIFFs and PDFs
            for (const doc of this.filteredDocuments) {
                if (this.isTiff(doc.image_url)) {
                    doc.processedTiffUrl = await this.convertTiffToBase64(doc.image_url);
                }
                if (doc.pdf_url) {
                    doc.pdfUrl = doc.pdf_url;
                }
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
            this.documents = [];
            this.filteredDocuments = [];
        } finally {
            this.isLoading = false;
        }
    }

    isTiff(url: string): boolean {
        return url?.toLowerCase().endsWith('.tif') || url?.toLowerCase().endsWith('.tiff');
    }

    async convertTiffToBase64(tiffUrl: string): Promise<string> {
        try {
            const response = await fetch(tiffUrl);
            const arrayBuffer = await response.arrayBuffer();

            // Decode the TIFF file
            const ifds = UTIF.decode(arrayBuffer);
            if (!ifds || ifds.length === 0) {
                throw new Error('No images found in TIFF');
            }

            // Decode the first image
            UTIF.decodeImage(arrayBuffer, ifds[0]); // Use decodeImage, not decodeImages
            const firstImage = ifds[0];
            if (!firstImage || !firstImage.width || !firstImage.height || firstImage.width <= 0 || firstImage.height <= 0) {
                throw new Error(`Invalid image dimensions: width=${firstImage?.width}, height=${firstImage?.height}`);
            }

            // Convert to RGBA
            const rgba = UTIF.toRGBA8(firstImage);

            // Create canvas and render image
            const canvas = document.createElement('canvas');
            canvas.width = firstImage.width;
            canvas.height = firstImage.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            const imgData = ctx.createImageData(canvas.width, canvas.height);
            imgData.data.set(rgba);
            ctx.putImageData(imgData, 0, 0);

            return canvas.toDataURL();
        } catch (error) {
            console.error('Failed to convert TIFF:', error);
            // Return fallback image
            return 'https://picsum.photos/1200/800?r=' + Math.random(); // Placeholder image
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
        const isTiffFile = this.isTiff(doc.image_url);
        const modal = await this.modalController.create({
            component: DocumentModalComponent,
            componentProps: { document: doc, isTiffFile: isTiffFile },
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

    async loadMoreDocuments(event: any) {
        if (this.isLoadingMore || this.currentPage >= this.lastPage) {
            event.target.disabled = true;
            event.target.complete();
            return;
        }

        this.isLoadingMore = true;
        try {
            this.currentPage++;
            const response = await this.recordsService.getDocumentsByPage(this.currentPage);

            const newDocuments = response.data ?? [];
            this.documents = [...this.documents, ...newDocuments];
            this.filteredDocuments = [...this.documents];
            this.lastPage = response.last_page ?? this.lastPage; // Just to be safe
        } catch (error) {
            console.error('Failed to load more documents:', error);
        } finally {
            this.isLoadingMore = false;
            event.target.complete();
        }
    }

}
