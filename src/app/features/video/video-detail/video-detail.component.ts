import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../../../core/services/video.service';
import { CommentService } from '../../../core/services/comment.service';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { Video } from '../../../core/models/video.model';
import { Comment as AppComment } from '../../../core/models/comment.model'; 
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit, OnDestroy {
  video: Video | null = null;
  comments: AppComment[] = []; 
  loading = true;
  loadingComments = true;
  error: string | null = null;
  isLoggedIn = false; 
  isLiked = false; 
  newCommentText = '';
  submittingComment = false;
  currentCommentPage = 0;
  totalCommentPages = 0;
  commentPageSize = 5;

  showChat = false;

  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  initialLoadTime: number = 0;
  liveStartTimestamp: number = 0;
  isBehindLive: boolean = false;
  pollingInterval: any;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private commentService: CommentService,
    private likeService: LikeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.showChat = this.isLoggedIn && this.video?.streamingStatus === 'LIVE';
      this.cdr.detectChanges();
    });

    this.route.params.subscribe(params => {
      const videoId = +params['id'];
      this.loadVideo(videoId);
      this.loadComments(videoId);
    });
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadVideo(id: number): void {
    if (!this.video) {
        this.loading = true;
    }
    
    this.error = null;

    this.videoService.getVideoById(id).subscribe({
      next: (video) => {
        const previousStatus = this.video?.streamingStatus;
        this.video = video;
        this.loading = false;
        this.showChat = this.isLoggedIn && this.video.streamingStatus === 'LIVE';

        if (this.video.streamingStatus === 'LIVE') {
            if (previousStatus !== 'LIVE') {
                this.stopPolling(); 
                setTimeout(() => {
                    this.syncLiveStream();
                }, 500);
            }
        } 
        else if (this.video.streamingStatus === 'WAITING') {
            if (!this.pollingInterval) {
                console.log("Video je u WAITING modu. Pokrećem auto-refresh...");
                this.pollingInterval = setInterval(() => {
                    this.loadVideo(id); 
                }, 5000); 
            }
        }

        if (this.video && this.isLoggedIn) {
          this.likeService.isLiked(this.video.id).subscribe({
            next: (res: { liked: boolean }) => {
              this.isLiked = res.liked;
            },
            error: (err: any) => { console.error(err); }
          });
        }
      },
      error: (err) => {
        this.error = 'Video nije pronađen';
        this.loading = false;
      }
    });
  }

  stopPolling(): void {
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
  }

  syncLiveStream(): void {
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement && this.video && this.video.currentOffset !== undefined) {
        const player = this.videoPlayerRef.nativeElement;
        

        this.liveStartTimestamp = Date.now() - (this.video.currentOffset * 1000);
        
        console.log("LIVE STREAM: Sinhronizacija. Offset: " + this.video.currentOffset + "s");
        player.currentTime = this.video.currentOffset;
        
        player.play().catch(e => {
            console.log("Autoplay blokiran, mutiram video da bih ga pustio:", e);
            player.muted = true; 
            player.play();
        });
    }
  }

  checkLiveLag(): void {
    if (!this.video || this.video.streamingStatus !== 'LIVE') return;

    const currentLiveTime = (Date.now() - this.liveStartTimestamp) / 1000;
    const playerTime = this.videoPlayerRef.nativeElement.currentTime;

    this.isBehindLive = (currentLiveTime - playerTime) > 10;
  }

  jumpToLive(): void {
    if (!this.video || this.video.streamingStatus !== 'LIVE') return;
    
    if (!this.liveStartTimestamp && this.video.currentOffset) {
        this.liveStartTimestamp = Date.now() - (this.video.currentOffset * 1000);
    }

    const currentLiveTime = (Date.now() - this.liveStartTimestamp) / 1000;
    
    console.log("Povratak na uživo -> Cilj: " + currentLiveTime + "s");

    const player = this.videoPlayerRef.nativeElement;
    
    player.currentTime = Math.max(0, currentLiveTime - 0.5);
    
    player.play().catch(e => console.error("Play error:", e));
    
    this.isBehindLive = false;
 }

  onSeeking(): void {
    if (!this.video || this.video.streamingStatus !== 'LIVE') return;

    const player = this.videoPlayerRef.nativeElement;
    
    const currentLiveTime = (Date.now() - this.liveStartTimestamp) / 1000;


    if (player.currentTime > currentLiveTime + 3) {
      console.log("Zabranjeno premotavanje unapred! Vraćam na live.");
      player.currentTime = currentLiveTime;
    }
    
  }

  onVideoEnded(): void {
    console.log("Video završen.");
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
        this.submittingComment = false;
        if (err.status === 429) {
          alert('Prekoračili ste limit od 60 komentara po satu. Pokušajte ponovo kasnije.');
        } else {
          alert('Došlo je do greške pri slanju komentara.');
        }
      }
    });
  }

  likeVideo(): void {
    if (!this.video) return;
    if (!this.isLoggedIn) {
      alert('Morate se prvo ulogovati da biste lajkovali video');
      return;
    }
    this.likeService.toggleLike(this.video.id).subscribe({
      next: (res) => {
        if (res.liked) {
          this.isLiked = true;
          this.video!.likeCount++;
        } else {
          this.isLiked = false;
          this.video!.likeCount--;
        }
      },
      error: (err) => { alert('Došlo je do greške.'); }
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