import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video, VideoPage } from '../models/video.model';


@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:8080/api/videos';

  constructor(private http: HttpClient) {}

  getAllVideos(page: number = 0, size: number = 12, filter: string = 'ALL'): Observable<VideoPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('filter', filter);
    
    return this.http.get<VideoPage>(this.apiUrl, { params });
  }

  getVideoById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`);
  }

  getVideosByUserId(userId: number, page: number = 0, size: number = 12): Observable<VideoPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<VideoPage>(`${this.apiUrl}/user/${userId}`, { params });
  }
  uploadVideo(formData: FormData): Observable<Video> {
    return this.http.post<Video>(this.apiUrl, formData);
  }

  registerView(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/view`, {});
  }

  getTrendingVideos(): Observable<Video[]> {
    return this.http.get<Video[]>('http://localhost:8080/api/trending');
  }
}