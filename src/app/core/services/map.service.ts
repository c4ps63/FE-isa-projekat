import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from '../models/video.model';
import { TileCluster } from '../models/tile-cluster.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = `${environment.apiUrl}/api/videos`;

  // Zoom nivoi za razlicite prikaze (moraju odgovarati backend vrijednostima)
  static readonly HIGH_ZOOM_THRESHOLD = 12;
  static readonly MEDIUM_ZOOM_THRESHOLD = 8;

  constructor(private http: HttpClient) { }

  getVideosByTile(z: number, x: number, y: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/tile/${z}/${x}/${y}`);
  }

  getClusteredVideosByTile(z: number, x: number, y: number): Observable<TileCluster[]> {
    return this.http.get<TileCluster[]>(`${this.apiUrl}/tile-clustered/${z}/${x}/${y}`);
  }

  getClusteredVideosByViewport(
    minLat: number, maxLat: number, minLng: number, maxLng: number, zoom: number, filter: string = 'ALL'
  ): Observable<TileCluster[]> {
    return this.http.get<TileCluster[]>(
      `${this.apiUrl}/viewport-clustered?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&zoom=${zoom}&filter=${filter}`
    );
  }

  getZoomLevel(zoom: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (zoom >= MapService.HIGH_ZOOM_THRESHOLD) {
      return 'HIGH';
    } else if (zoom >= MapService.MEDIUM_ZOOM_THRESHOLD) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }
}