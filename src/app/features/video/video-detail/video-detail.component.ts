import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../../../core/services/video.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Video } from '../../../core/models/video.model';

import { Comment as AppComment } from '../../../core/models/comment.model'; 

import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {
  video: Video | null = null;
  
  comments: AppComment[] = []; 
  
  loading = true;
  loadingComments = true;
  error: string | null = null;

  isLoggedIn = false; 
  newCommentText = '';
  submittingComment = false;

  currentCommentPage = 0;
  totalCommentPages = 0;
  commentPageSize = 20;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private commentService: CommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.cdr.detectChanges();
    });

    this.route.params.subscribe(params => {
      const videoId = +params['id'];
      this.loadVideo(videoId);
      this.loadComments(videoId);
    });
  }

  loadVideo(id: number): void {
    this.loading = true;
    this.error = null;

    this.videoService.getVideoById(id).subscribe({
      next: (video) => {
        this.video = video;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Video nije pronađen';
        this.loading = false;
        console.error('Error loading video:', err);
      }
    });
  }

  loadComments(videoId: number): void {
    this.loadingComments = true;

    this.commentService.getCommentsByVideoId(videoId, this.currentCommentPage, this.commentPageSize).subscribe({
      next: (response) => {
        if (this.currentCommentPage === 0) {
            this.comments = response.content; 
        } else {
            this.comments = [...this.comments, ...response.content];
        }
        this.totalCommentPages = response.totalPages;
        this.loadingComments = false;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loadingComments = false;
      }
    });
  }

  loadMoreComments(): void {
    if (this.currentCommentPage < this.totalCommentPages - 1 && this.video) {
      this.currentCommentPage++;
      this.loadComments(this.video.id);
    }
  }

  submitComment(): void {
    if (!this.newCommentText.trim() || !this.video) return;

    this.submittingComment = true;

    this.commentService.createComment(this.video.id, this.newCommentText).subscribe({
      next: (newComment: AppComment) => {
        this.comments.unshift(newComment);
        this.newCommentText = '';
        this.submittingComment = false;
      },
      error: (err: any) => {
        console.error('Greska pri slanju komentara', err);
        this.submittingComment = false;
        alert('Došlo je do greške pri slanju komentara.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Pre ${diffMins} minuta`;
    if (diffHours < 24) return `Pre ${diffHours} sati`;
    if (diffDays < 7) return `Pre ${diffDays} dana`;
    
    return date.toLocaleDateString('sr-RS');
  }
}
