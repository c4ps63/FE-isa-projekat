import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Comment as AppComment, CommentPage } from '../models/comment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/api/comments`;

  constructor(private http: HttpClient) {}

  getCommentsByVideoId(videoId: number, page: number = 0, size: number = 20): Observable<CommentPage> {
    let params = new HttpParams()
      .set('videoId', videoId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CommentPage>(`${this.apiUrl}/video/${videoId}`, { params });
  }

  createComment(videoId: number, text: string): Observable<AppComment> {
    return this.http.post<AppComment>(this.apiUrl, { videoId, text });
  }
}