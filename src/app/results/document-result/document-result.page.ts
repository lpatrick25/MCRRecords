import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { DocumentData, OCRConfiguration, PageData, ScanbotBinarizationFilter, ScanbotSDK } from "capacitor-plugin-scanbot-sdk"; // Removed OutputMode
import { CommonUtils } from "../../utils/common-utils";
import { FileUtils } from "../../utils/file-utils";
import { ActionSheetController, IonicModule, NavController } from "@ionic/angular";
import { ImageUtils } from "../../utils/image-utils";
import { DocumentScanningFlow, startDocumentScanner } from "capacitor-plugin-scanbot-sdk/ui_v2";
import { Capacitor } from "@capacitor/core";
import { RecordsService } from 'src/app/services/records.service';

interface PageDataResult {
    page: PageData;
    pagePreviewWebViewPath: string;
}

@Component({
    selector: 'app-document-result',
    templateUrl: './document-result.page.html',
    styleUrls: ['./document-result.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class DocumentResultPage implements OnInit {
    formSubmission: any;
    document!: DocumentData;
    pageImagePreviews: PageDataResult[] = [];

    private navController = inject(NavController);
    private utils = inject(CommonUtils);
    private fileUtils = inject(FileUtils);
    private actionSheetCtrl = inject(ActionSheetController);
    private imageUtils = inject(ImageUtils);
    private activatedRoute = inject(ActivatedRoute);

    constructor(private router: Router, private apiService: RecordsService) { }

    async ngOnInit() {
        this.activatedRoute.paramMap.subscribe(async (params) => {
            const documentID = params.get('documentID') as string;
            // Safely get the navigation state
            const navigation = this.router.getCurrentNavigation();
            this.formSubmission = navigation?.extras?.state?.['submission'];
            await this.loadDocument(documentID);
            console.log('Document ID:', documentID);
            console.log('Form Submission:', this.formSubmission);
        });
    }

    private updateCurrentDocument(updatedDocument: DocumentData) {
        this.document = updatedDocument;
        this.pageImagePreviews = this.document.pages.map(page => ({
            page: page,
            pagePreviewWebViewPath: Capacitor.convertFileSrc((page.documentImagePreviewURI || page.originalImageURI) + '?' + Date.now())
        } as PageDataResult));
    }

    async onPageSelect(page: PageData) {
        await this.navController.navigateForward(['/page-result', this.document.uuid, page.uuid]);
    }

    private async loadDocument(id: string) {
        try {
            /** Load the document from disc */
            const documentResult = await ScanbotSDK.Document.loadDocument({ documentID: id });
            this.updateCurrentDocument(documentResult);
        } catch (e: any) {
            await this.utils.showErrorAlert(e.message);
        }
    }

    async onContinueScanning() {
        try {
            /*** Create the document configuration object and
             * start the document scanner with the configuration and documentUUID */
            const configuration = new DocumentScanningFlow();
            configuration.documentUuid = this.document.uuid;
            configuration.cleanScanningSession = false;
            await startDocumentScanner(configuration);
            this.loadDocument(this.document.uuid);
        } catch (e: any) {
            await this.utils.showErrorAlert(e.message);
        }
    }

    async onAddPage() {
        try {
            // Select image from the library
            const imageFileUri = await this.imageUtils.selectImageFromLibrary();
            if (!imageFileUri) {
                return;
            }
            await this.utils.showLoader();
            /** Add a page to the document */
            const documentResult = await ScanbotSDK.Document.addPage({
                documentID: this.document.uuid,
                imageFileUri,
                documentDetection: true,
            });
            /*** Handle the result */
            this.updateCurrentDocument(documentResult);
        } catch (e: any) {
            await this.utils.showErrorAlert(e.message);
        } finally {
            await this.utils.dismissLoader();
        }
    }

    async onExport() {
        try {
            await this.utils.showLoader();

            // Create TIFF file from the document
            const tiffResult = await ScanbotSDK.Document.createTIFF({
                documentID: this.document.uuid,
                options: {
                    binarizationFilter: new ScanbotBinarizationFilter({
                        outputMode: 'ANTIALIASED',
                    }),
                    dpi: 300,
                    compression: 'ADOBE_DEFLATE',
                },
            });

            // Log TIFF URI
            console.log('Generated TIFF File URI:', tiffResult.tiffFileUri);

            const ocrConfiguration: OCRConfiguration | undefined = {
                engineMode: 'SCANBOT_OCR',
            };

            // Create PDF file from the document (similar to TIFF creation)
            const pdfResult = await ScanbotSDK.Document.createPDF({
                documentID: this.document.uuid,
                options: {
                    pageSize: 'A4',
                    pageDirection: 'PORTRAIT',
                    ocrConfiguration: ocrConfiguration,
                },
            });

            // Log PDF URI
            console.log('Generated PDF File URI:', pdfResult.pdfFileUri);

            // Check if PDF URI is valid
            if (!pdfResult.pdfFileUri) {
                throw new Error('PDF file URI is missing.');
            }

            // Submit the document with both TIFF and PDF files
            await this.apiService.submitDocument(this.formSubmission, tiffResult.tiffFileUri, pdfResult.pdfFileUri);

            await this.utils.showInfoAlert('Document uploaded successfully!');
            await this.navController.navigateRoot('/record');
        } catch (e: any) {
            console.error('Error during document export:', e);
            await this.utils.showErrorAlert(e.message);
        } finally {
            await this.utils.dismissLoader();
        }
    }

}
