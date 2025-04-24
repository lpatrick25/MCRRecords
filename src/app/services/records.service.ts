import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RecordsService {

    private baseUrl = 'https://bfp.unitech.host/api';

    constructor(private http: HttpClient) { }

    login(userName: string, password: string): Observable<any> {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
        });

        return this.http.post(`${this.baseUrl}/login`, {
            email: userName,
            password: password,
        }, { headers });
    }

    async submitDocument(formSubmission: any, tiffFileUri: string): Promise<any> {
        try {
            const formData = new FormData();

            // Append form data as a JSON string (optional: split into individual fields if needed)
            formData.append('formData', JSON.stringify(formSubmission));

            // Use Capacitor to convert local file URI for fetch()
            const safeUri = Capacitor.convertFileSrc(tiffFileUri);
            console.log('Fetching file from URI:', safeUri);

            const fileBlob = await fetch(safeUri).then(res => {
                if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);
                return res.blob();
            });

            formData.append('tiffFile', fileBlob, 'document.tiff');

            // Send the form with file
            return await lastValueFrom(
                this.http.post(`${this.baseUrl}/documents/submit`, formData)
            );
        } catch (error: any) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }
}
