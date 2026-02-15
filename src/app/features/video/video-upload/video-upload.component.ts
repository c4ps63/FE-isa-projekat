import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VideoService } from 'src/app/core/services/video.service';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent {
  uploadForm: FormGroup;
  selectedVideoFile: File | null = null;
  selectedThumbnailFile: File | null = null;
  videoDuration: number = 0;
  minDate: string;

  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      tags: [''], 
      location: [''],
      isScheduled: [false],
      scheduledDate: [''],
      scheduledTime: ['']
    });
  }

  private parseAddress(fullAddress: string): { street: string, number: string, city: string } {
    const regex = /^(.*?)\s+(\d+[a-zA-Z]?)[,\s]+(.*)$/;
    const match = fullAddress.match(regex);

    if (match) {
      return {
        street: match[1].trim(),
        number: match[2].trim(),
        city: match[3].trim()
      };
    }

    return {
      street: '',
      number: '',
      city: fullAddress.trim()
    };
  }

  private isValidScheduleTime(date: string, time: string): boolean {
    if (!date || !time) return false;

    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      return false;
    }

    return true;
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        this.errorMessage = 'Video fajl je prevelik! Maksimalna veličina je 200MB.';
        this.selectedVideoFile = null;
        return;
      }
      this.selectedVideoFile = file;
      this.errorMessage = '';

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        this.videoDuration = Math.floor(video.duration);
        console.log("Detektovano trajanje videa: " + this.videoDuration + " sekundi");
      };
      video.src = URL.createObjectURL(file);
    }
  }

  onThumbnailSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedThumbnailFile = file;
    }
  }

  onSubmit() {
    if (this.uploadForm.invalid || !this.selectedVideoFile || !this.selectedThumbnailFile) {
      this.errorMessage = 'Molimo popunite sva obavezna polja i izaberite fajlove.';
      return;
    }

    const isScheduled = this.uploadForm.get('isScheduled')?.value;
    const scheduledDate = this.uploadForm.get('scheduledDate')?.value;
    const scheduledTime = this.uploadForm.get('scheduledTime')?.value;

    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        this.errorMessage = 'Molimo unesite datum i vreme za zakazivanje.';
        return;
      }

      if (!this.isValidScheduleTime(scheduledDate, scheduledTime)) {
        this.errorMessage = 'Vreme zakazivanja mora biti u budućnosti!';
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('description', this.uploadForm.get('description')?.value);

    const rawLocation = this.uploadForm.get('location')?.value; 
    if (rawLocation) {
        const parsed = this.parseAddress(rawLocation);
        formData.append('street', parsed.street);
        formData.append('number', parsed.number);
        formData.append('city', parsed.city);

        console.log('Parsirana lokacija:', parsed);
    } else {
        formData.append('street', '');
        formData.append('number', '');
        formData.append('city', '');
    }

    const tagsString = this.uploadForm.get('tags')?.value;
    if (tagsString) {
        formData.append('tags', tagsString); 
    } 

    formData.append('duration', this.videoDuration.toString());
    formData.append('videoFile', this.selectedVideoFile);
    formData.append('thumbnailFile', this.selectedThumbnailFile);

    if (isScheduled && scheduledDate && scheduledTime) {
      formData.append('isScheduled', 'true');
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
      formData.append('scheduledTime', scheduledDateTime);
    } else {
      formData.append('isScheduled', 'false');
    }

    this.videoService.uploadVideo(formData).subscribe({
      next: (response) => {
        console.log('Upload uspešan', response);
        this.isLoading = false;
        this.router.navigate(['/']); 
      },
      error: (error) => {
        console.error('Greška pri uploadu', error);
        if (error.status === 401 || error.status === 403) {
             this.errorMessage = 'Niste ulogovani ili je sesija istekla!';
        } else if (error.status === 413) {
             this.errorMessage = 'Fajl je prevelik!';
        } else {
             this.errorMessage = `Došlo je do greške: ${error.message}`;
        }
        this.isLoading = false;
      }
    });
  }
}