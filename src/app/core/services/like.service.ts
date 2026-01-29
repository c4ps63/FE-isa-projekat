import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = 'http://localhost:8080/api/likes';

  constructor(private http: HttpClient) {}

  /**
   * Toggle like za dati video
   */
  toggleLike(videoId: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/video/${videoId}`, {});
  }

  /**
   * Provera da li je korisnik lajkovao dati video
   */
  isLiked(videoId: number): Observable<{ liked: boolean }> {
    return this.http.get<{ liked: boolean }>(`${this.apiUrl}/video/${videoId}/is-liked`);

  }
}
