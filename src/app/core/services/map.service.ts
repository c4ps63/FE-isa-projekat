import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from '../models/video.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = 'http://localhost:8080/api/videos';

  constructor(private http: HttpClient) { }

  getVideosByTile(z: number, x: number, y: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/tile/${z}/${x}/${y}`);
  }
}