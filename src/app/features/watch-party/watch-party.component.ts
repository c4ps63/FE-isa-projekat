import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WatchPartyService } from '../../core/services/watch-party.service';
import { VideoService } from '../../core/services/video.service';
import { Video, VideoPage } from '../../core/models/video.model';

@Component({
  selector: 'app-watch-party',
  templateUrl: './watch-party.component.html',
  styleUrls: ['./watch-party.component.css']
})
export class WatchPartyComponent implements OnInit, OnDestroy {

  joinCode: string = '';
  videos: Video[] = [];
  error: string = '';
  codeCopied: boolean = false;

  private videoPlaySub: Subscription | null = null;

  constructor(
    public watchPartyService: WatchPartyService,
    private videoService: VideoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.watchPartyService.inRoom) {
      this.watchPartyService.connect(this.watchPartyService.activeRoom!.roomCode);
      this.subscribeToVideoPlay();
      if (this.watchPartyService.isCreator) {
        this.loadVideos();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.videoPlaySub) {
      this.videoPlaySub.unsubscribe();
      this.videoPlaySub = null;
    }
  }

  createRoom(): void {
    this.error = '';
    this.watchPartyService.createRoom().subscribe({
      next: (room) => {
        this.watchPartyService.setActiveRoom(room, true);
        this.watchPartyService.connect(room.roomCode);
        this.subscribeToVideoPlay();
        this.loadVideos();
      },
      error: () => {
        this.error = 'Greska pri kreiranju sobe.';
      }
    });
  }

  joinRoom(): void {
    this.error = '';
    if (!this.joinCode || this.joinCode.trim().length === 0) {
      this.error = 'Unesite kod sobe.';
      return;
    }

    const code = this.joinCode.trim().toUpperCase();
    this.watchPartyService.getRoomByCode(code).subscribe({
      next: (room) => {
        this.watchPartyService.setActiveRoom(room, false);
        this.watchPartyService.connect(room.roomCode);
        this.subscribeToVideoPlay();
      },
      error: () => {
        this.error = 'Soba nije pronadjena ili je zatvorena.';
      }
    });
  }

  private subscribeToVideoPlay(): void {
    if (this.videoPlaySub) {
      this.videoPlaySub.unsubscribe();
    }
    this.videoPlaySub = this.watchPartyService.onVideoPlay().subscribe(videoId => {
      this.router.navigate(['/video', videoId]);
    });
  }

  playVideo(videoId: number): void {
    if (this.watchPartyService.activeRoom && this.watchPartyService.isCreator) {
      this.watchPartyService.sendPlayVideo(this.watchPartyService.activeRoom.roomCode, videoId);
    }
  }

  leaveRoom(): void {
    if (this.videoPlaySub) {
      this.videoPlaySub.unsubscribe();
      this.videoPlaySub = null;
    }
    this.watchPartyService.leaveAndClose();
  }

  copyCode(): void {
    if (this.watchPartyService.activeRoom) {
      navigator.clipboard.writeText(this.watchPartyService.activeRoom.roomCode);
      this.codeCopied = true;
      setTimeout(() => this.codeCopied = false, 2000);
    }
  }

  private loadVideos(): void {
    this.videoService.getAllVideos(0, 50).subscribe({
      next: (page: VideoPage) => {
        this.videos = page.content;
      }
    });
  }
}
