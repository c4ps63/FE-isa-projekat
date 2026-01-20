import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../../core/services/map.service';
import { Video } from '../../../core/models/video.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map: any;
  private markers: L.LayerGroup = L.layerGroup();
  
  @Output() videosFound = new EventEmitter<Video[]>();

  constructor(private mapService: MapService) { }

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => this.loadVisibleTiles(), 500);
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    
    this.markers.addTo(this.map);
    this.fixMarkerIcons();

    this.map.on('moveend', () => {
      this.loadVisibleTiles();
    });
  }

  private loadVisibleTiles(): void {
    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    const minTile = this.getTileFromCoords(bounds.getNorthWest().lat, bounds.getNorthWest().lng, zoom);
    const maxTile = this.getTileFromCoords(bounds.getSouthEast().lat, bounds.getSouthEast().lng, zoom);

    const requests = [];

    for (let x = minTile.x; x <= maxTile.x; x++) {
      for (let y = minTile.y; y <= maxTile.y; y++) {
        requests.push(this.mapService.getVideosByTile(zoom, x, y));
      }
    }

    forkJoin(requests).subscribe({
      next: (responses: Video[][]) => {
        
        const allVideos = new Map<number, Video>();

        responses.forEach(videoList => {
          videoList.forEach(video => {
            allVideos.set(video.id, video);
          });
        });

        const uniqueVideos = Array.from(allVideos.values());
        
        this.updateMapMarkers(uniqueVideos);
        this.videosFound.emit(uniqueVideos);
      },
      error: (err) => console.error(err)
    });
  }

  private updateMapMarkers(videos: Video[]): void {
    this.markers.clearLayers();
    videos.forEach(video => {
      if (video.latitude && video.longitude) {
        const marker = L.marker([video.latitude, video.longitude]);
        
        const popupContent = `
           <div style="text-align:center">
             <b>${video.title}</b><br>
             <img src="http://localhost:8080/uploads/${video.thumbnailUrl}" style="width:100px; margin-top:5px;">
           </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.addLayer(marker);
      }
    });
  }

  private getTileFromCoords(lat: number, lng: number, zoom: number) {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y };
  }

  private fixMarkerIcons(): void {
     const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
     const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
     const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
     
     const iconDefault = L.icon({
       iconRetinaUrl, iconUrl, shadowUrl,
       iconSize: [25, 41], iconAnchor: [12, 41],
       popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41]
     });
     L.Marker.prototype.options.icon = iconDefault;
  }
}