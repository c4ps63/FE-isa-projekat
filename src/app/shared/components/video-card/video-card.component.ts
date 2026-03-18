import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Video } from '../../../core/models/video.model';
import { DurationPipe } from '../../pipes/duration.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css']
})
export class VideoCardComponent {
  @Input() video!: Video;
  uploadsUrl = environment.apiUrl + '/uploads/';
}