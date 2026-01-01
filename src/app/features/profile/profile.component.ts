import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { VideoService } from '../../core/services/video.service';
import { User } from '../../core/models/user.model';
import { Video } from '../../core/models/video.model';
import { VideoCardComponent } from '../../shared/components/video-card/video-card.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  videos: Video[] = [];
  loading = true;
  loadingVideos = true;
  error: string | null = null;

  currentPage = 0;
  totalPages = 0;
  pageSize = 12;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const username = params['username'];
      this.loadUser(username);
    });
  }

  loadUser(username: string): void {
    this.loading = true;
    this.error = null;

    this.userService.getUserByUsername(username).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.loadUserVideos(user.id);
      },
      error: (err) => {
        this.error = 'Korisnik nije pronađen';
        this.loading = false;
        console.error('Error loading user:', err);
      }
    });
  }

  loadUserVideos(userId: number): void {
    this.loadingVideos = true;

    this.videoService.getVideosByUserId(userId, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.videos = response.content;
        this.totalPages = response.totalPages;
        this.loadingVideos = false;
      },
      error: (err) => {
        console.error('Error loading user videos:', err);
        this.loadingVideos = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1 && this.user) {
      this.currentPage++;
      this.loadUserVideos(this.user.id);
      window.scrollTo(0, 400);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0 && this.user) {
      this.currentPage--;
      this.loadUserVideos(this.user.id);
      window.scrollTo(0, 400);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}