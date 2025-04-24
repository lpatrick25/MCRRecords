import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    },
    {
        path: 'record',
        loadComponent: () => import('./record/record.page').then((m) => m.RecordPage),
    },
    {
        path: 'generic-document-result-fields/:documents',
        loadComponent: () =>
            import(
                './results/scan-result-fields/generic-document-result-fields/generic-document-result-fields.page'
            ).then((m) => m.GenericDocumentResultFieldsPage),
    },
    {
        path: 'generic-document-result-fields/:documents/:imageFileUri',
        loadComponent: () =>
            import(
                './results/scan-result-fields/generic-document-result-fields/generic-document-result-fields.page'
            ).then((m) => m.GenericDocumentResultFieldsPage),
    },
    {
        path: 'check-result-fields/:result',
        loadComponent: () =>
            import(
                './results/scan-result-fields/check-result-fields/check-result-fields.page'
            ).then((m) => m.CheckResultFieldsPage),
    },
    {
        path: 'medical-certificate-result-fields/:result',
        loadComponent: () =>
            import(
                './results/scan-result-fields/medical-certificate-result-fields/medical-certificate-result-fields.page'
            ).then((m) => m.MedicalCertificateResultFieldsPage),
    },
    {
        path: 'mrz-result-fields/:result',
        loadComponent: () => import('./results/scan-result-fields/mrz-result-fields/mrz-result-fields.page').then(m => m.MrzResultFieldsPage)
    },
    {
        path: 'ehic-result-fields/:result',
        loadComponent: () => import('./results/scan-result-fields/ehic-result-fields/ehic-result-fields.page').then(m => m.EHICResultFieldsPage)
    },
    {
        path: 'document-result/:documentID',
        loadComponent: () => import('./results/document-result/document-result.page').then(m => m.DocumentResultPage)
    },
    {
        path: 'page-result/:documentID/:pageID',
        loadComponent: () => import('./results/page-result/page-result.page').then(m => m.PageResultPage)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'certificate',
        loadComponent: () => import('./certificate/certificate.page').then(m => m.CertificatePage)
    },
    {
        path: 'document-form/:type/:title',
        loadComponent: () => import('./document-form/document-form.page').then(m => m.DocumentFormPage)
    }

];
