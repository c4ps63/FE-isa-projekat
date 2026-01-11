import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = 'http://localhost:8080/api/likes';

  constructor(private http: HttpClient) {}

  toggleLike(videoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle/${videoId}`, {});
  }

  isVideoLikedByUser(videoId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-liked/${videoId}`);
  }

  getLikeCount(videoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${videoId}`);
  }
}
