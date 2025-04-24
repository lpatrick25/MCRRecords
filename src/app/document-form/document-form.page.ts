import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { Colors } from 'src/theme/theme';
import { CommonUtils } from '../utils/common-utils';

import {
    DocumentScanningFlow,
    PageSnapCheckMarkAnimation,
    PageSnapFunnelAnimation,
    startDocumentScanner,
} from 'capacitor-plugin-scanbot-sdk/ui_v2';

interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    dob: string;
    placeOfBirth: string;
    fatherName: string;
    motherName: string;
    registryNumber: string;
}

interface DocumentSubmission extends FormData {
    documentType: string;
    documentTitle: string;
}

@Component({
    selector: 'app-document-form',
    templateUrl: './document-form.page.html',
    styleUrls: ['./document-form.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class DocumentFormPage implements OnInit {

    documentType = '';
    documentTitle = '';

    formData: FormData = {
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        dob: '',
        placeOfBirth: '',
        fatherName: '',
        motherName: '',
        registryNumber: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private utils: CommonUtils
    ) { }

    ngOnInit(): void {
        this.documentType = decodeURIComponent(this.route.snapshot.paramMap.get('type') || '');
        this.documentTitle = decodeURIComponent(this.route.snapshot.paramMap.get('title') || '');
    }

    async submitForm(form: NgForm): Promise<void> {
        if (!form.valid) {
            console.warn('Form is invalid');
            this.utils.showErrorAlert('Please complete all required fields.');
            return;
        }

        const submission: DocumentSubmission = {
            documentType: this.documentType,
            documentTitle: this.documentTitle,
            ...this.formData
        };

        try {
            const configuration = new DocumentScanningFlow();
            configuration.outputSettings.pagesScanLimit = 1;
            configuration.screens.review.enabled = false;
            configuration.screens.camera.cameraConfiguration.autoSnappingEnabled = true;

            configuration.screens.camera.captureFeedback.snapFeedbackMode =
                new PageSnapFunnelAnimation({}); // or use PageSnapCheckMarkAnimation({})

            configuration.screens.camera.bottomBar.autoSnappingModeButton.visible = false;
            configuration.screens.camera.bottomBar.manualSnappingModeButton.visible = false;
            configuration.screens.camera.bottomBar.importButton.title.visible = true;
            configuration.screens.camera.bottomBar.torchOnButton.title.visible = true;
            configuration.screens.camera.bottomBar.torchOffButton.title.visible = true;

            configuration.palette.sbColorPrimary = Colors.scanbotRed;
            configuration.palette.sbColorOnPrimary = '#ffffff';

            configuration.screens.camera.userGuidance.statesTitles.tooDark = 'Need more lighting to detect a document';
            configuration.screens.camera.userGuidance.statesTitles.tooSmall = 'Document too small';
            configuration.screens.camera.userGuidance.statesTitles.noDocumentFound = 'Could not detect a document';

            const documentResult = await startDocumentScanner(configuration);

            if (documentResult.status === 'OK') {
                console.log('Submitted JSON:', JSON.stringify(submission, null, 2));

                // Redirect and pass data using navigation state (safer than query param)
                this.router.navigate(['/document-result', documentResult.uuid], {
                    state: { submission }
                });

                // 🚀 LATER: Post `submission` to backend API here
                // await this.apiService.submitDocument(submission);

                this.utils.showInfoAlert('Document submitted successfully!');
            }
        } catch (error: any) {
            this.utils.showErrorAlert(error.message || 'An unexpected error occurred.');
        }
    }
}
