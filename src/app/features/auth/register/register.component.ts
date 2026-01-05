import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerRequest = {
    email: '',
    username: '',
    password: '',
    repeatedPassword: '',
    firstName: '',
    lastName: '',
    address: ''
  };

  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.errorMessage = '';

    if (!this.registerRequest.email || !this.registerRequest.username || 
        !this.registerRequest.password || !this.registerRequest.repeatedPassword ||
        !this.registerRequest.firstName || !this.registerRequest.lastName || 
        !this.registerRequest.address) {
      this.errorMessage = 'Sva polja su obavezna.';
      return;
    }

    if (this.registerRequest.password !== this.registerRequest.repeatedPassword) {
      this.errorMessage = 'Lozinke se ne podudaraju.';
      return;
    }

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        alert(response);
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error || 'Došlo je do greške prilikom registracije.';
      }
    });
  }
}