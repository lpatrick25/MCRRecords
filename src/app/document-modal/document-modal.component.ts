import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import * as UTIF from 'utif';

@Component({
    selector: 'app-document-modal',
    templateUrl: './document-modal.component.html',
    styleUrls: ['./document-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DocumentModalComponent implements OnInit {
    @Input() document: any; // Document details passed as input
    @Input() isTiffFile: boolean = false; // Default value to false if not provided
    public pdfUrl: string = '';
    public pdfLoaded: boolean = true;

    constructor(private modalController: ModalController) { }

    ngOnInit() {
        if (this.isTiffFile) {
            // If the document is a TIFF, show the TIFF image
            // this.loadTiff(this.document.image_url);
        } else if (this.document.pdfUrl) {
            // If the document has a PDF, load the PDF
            this.loadPdf(this.document.pdfUrl);
        }
    }

    dismiss() {
        this.modalController.dismiss();
    }

    async loadPdf(pdfUrl: string) {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        loadingTask.promise.then(pdf => {
            pdf.getPage(1).then(page => {  // Render only the first page for now
                const scale = 1.5;
                const viewport = page.getViewport({ scale });

                const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    page.render({
                        canvasContext: ctx,
                        viewport: viewport,
                    }).promise.then(() => {
                        this.pdfLoaded = true;
                    });
                }
            });
        });
    }

    isTiff(url: string): boolean {
        return url?.toLowerCase().endsWith('.tif') || url?.toLowerCase().endsWith('.tiff');
    }

}
