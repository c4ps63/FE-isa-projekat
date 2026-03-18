import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  isAuthenticated = false;
  menuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  ngDoCheck(): void {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }
}
