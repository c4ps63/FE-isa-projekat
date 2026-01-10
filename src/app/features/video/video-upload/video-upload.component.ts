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
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      tags: [''], 
      location: ['']
    });
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

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('description', this.uploadForm.get('description')?.value);
    const location = this.uploadForm.get('location')?.value; 
    if (location) {
        formData.append('location', location);
    }

    const tagsString = this.uploadForm.get('tags')?.value;
    if (tagsString) {
        
        formData.append('tags', tagsString); 
    } 

    formData.append('videoFile', this.selectedVideoFile);
    formData.append('thumbnailFile', this.selectedThumbnailFile);

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