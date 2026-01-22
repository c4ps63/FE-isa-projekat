import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../core/services/video.service';
import { Video } from '../../core/models/video.model';
import { VideoCardComponent } from '../../shared/components/video-card/video-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  videos: Video[] = [];
  loading = true; 
  error: string | null = null;
  
  currentPage = 0;
  totalPages = 0;
  pageSize = 12;
  selectedFilter: string = 'ALL';

  constructor(private videoService: VideoService) {}

  ngOnInit(): void {

  }

  updateVideoList(videosFromMap: Video[]) {
    this.loading = false;
    this.videos = videosFromMap;
    this.totalPages = 1; 
    if (this.videos.length === 0) {
    }
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.target.value;
    this.currentPage = 0;
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;
    this.error = null;

    this.videoService.getAllVideos(this.currentPage, this.pageSize, this.selectedFilter).subscribe({
      next: (response) => {
        this.videos = response.content;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Greška pri učitavanju videa';
        this.loading = false;
        console.error('Error loading videos:', err);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadVideos();
      window.scrollTo(0, 0);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadVideos();
      window.scrollTo(0, 0);
    }
  }
}