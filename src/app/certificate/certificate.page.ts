import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-certificate',
    templateUrl: './certificate.page.html',
    styleUrls: ['./certificate.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class CertificatePage implements OnInit {

    documents = [
        {
            title: 'Certificate of Live Birth',
            description: 'Official record of a child’s birth registered in the municipality.',
            icon: 'document-text-outline',
            type: 'live_birth'
        },
        {
            title: 'Certificate of Death',
            description: 'Legal document confirming a person’s death as recorded by the civil registrar.',
            icon: 'skull-outline',
            type: 'death'
        },
        {
            title: 'Certificate of Marriage',
            description: 'Legal proof that two individuals are officially married.',
            icon: 'heart-outline',
            type: 'marriage'
        },
        {
            title: 'Certificate of Fetus Death',
            description: 'Record of fetal death reported to and certified by the local registrar.',
            icon: 'sad-outline',
            type: 'fetus_death'
        }
    ];

    constructor(private router: Router) { }

    ngOnInit() {
    }

    goToForm(type: string, title: string) {
        this.router.navigate(['/document-form', type, encodeURIComponent(title)]);
    }


}
