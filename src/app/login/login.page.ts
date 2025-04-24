import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecordsService } from '../services/records.service';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class LoginPage {
    loginForm: FormGroup;
    loading = false;
    showPassword = false;
    private navController = inject(NavController);

    constructor(
        private fb: FormBuilder,
        private recordService: RecordsService,
        private toastController: ToastController,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            userName: ['', Validators.required],
            password: [
                '',
                [Validators.required, Validators.minLength(8), Validators.maxLength(12)],
            ],
        });
    }

    // 🔐 Form submission
    async onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const { userName, password } = this.loginForm.value;

        this.recordService.login(userName, password).subscribe({
            next: async (response: any) => {
                this.loading = false;
                console.log('Login success:', response);

                const toast = await this.toastController.create({
                    message: response.message,
                    duration: 2000,
                    color: 'success',
                });
                await toast.present();

                // Store user info (adjust as needed)
                localStorage.setItem('user', JSON.stringify(response.user));

                // Navigate to home or desired route
                this.navController.navigateRoot('/record');
            },
            error: async (err) => {
                this.loading = false;
                console.error('Login failed:', err);

                const toast = await this.toastController.create({
                    message: err?.error?.message || 'Login failed.',
                    duration: 2000,
                    color: 'danger',
                });
                await toast.present();
            },
        });
    }

    // ✅ Validation helper for form fields
    isInvalid(controlName: string): boolean {
        const control = this.loginForm.get(controlName);
        return !!(control && control.invalid && (control.touched || control.dirty));
    }
}
