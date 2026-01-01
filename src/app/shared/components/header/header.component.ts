import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isAuthenticated = false; // Kasnije ćeš ovo povezati sa AuthService

  // Placeholder metode za kasnije
  login(): void {
    console.log('Login clicked');
  }

  register(): void {
    console.log('Register clicked');
  }

  logout(): void {
    console.log('Logout clicked');
  }
}