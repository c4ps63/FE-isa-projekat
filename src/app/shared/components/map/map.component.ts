import { Component, AfterViewInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../../core/services/map.service';
import { Video } from '../../../core/models/video.model';
import { TileCluster } from '../../../core/models/tile-cluster.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private markers: L.LayerGroup = L.layerGroup();
  private gridLayer: L.LayerGroup = L.layerGroup();

  // Zoom nivoi (moraju odgovarati backend vrijednostima)
  private readonly HIGH_ZOOM_THRESHOLD = 12;
  private readonly MEDIUM_ZOOM_THRESHOLD = 8;
  private readonly EFFECTIVE_ZOOM_LOW = 4;
  private readonly EFFECTIVE_ZOOM_MEDIUM = 8;

  // Za debounce i cleanup
  private loadTiles$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private currentRequest: Subscription | null = null;

  @Input() filter: string = 'ALL';
  @Output() videosFound = new EventEmitter<Video[]>();

  constructor(private mapService: MapService) { }

  // Javna metoda za reload sa novim filterom
  reloadWithFilter(newFilter: string): void {
    this.filter = newFilter;
    this.triggerLoadTiles();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.setupTileLoader();
    setTimeout(() => {
      this.triggerLoadTiles();
      this.drawTileGrid();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupTileLoader(): void {
    this.loadTiles$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadVisibleTiles();
    });
  }

  private triggerLoadTiles(): void {
    this.loadTiles$.next();
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.gridLayer.addTo(this.map);
    this.markers.addTo(this.map);
    this.fixMarkerIcons();

    this.map.on('moveend', () => {
      this.triggerLoadTiles();
      this.drawTileGrid();
    });
  }

  private loadVisibleTiles(): void {
    // Otkaži prethodni request ako postoji
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }

    const bounds = this.map.getBounds();
    const zoom = Math.floor(this.map.getZoom());

    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    console.log(`Loading viewport: zoom=${zoom}, filter=${this.filter}, bounds=[${minLat.toFixed(4)}, ${maxLat.toFixed(4)}, ${minLng.toFixed(4)}, ${maxLng.toFixed(4)}]`);

    this.currentRequest = this.mapService.getClusteredVideosByViewport(
      minLat, maxLat, minLng, maxLng, zoom, this.filter
    ).subscribe({
      next: (clusters: TileCluster[]) => {
        console.log(`Received ${clusters.length} clusters`);

        this.updateMapMarkersWithClusters(clusters);

        // Emituj sve video snimke za listu
        const allVideos = clusters.map(c => c.representativeVideo);
        this.videosFound.emit(allVideos);
      },
      error: (err) => console.error(err)
    });
  }

  private updateMapMarkersWithClusters(clusters: TileCluster[]): void {
    this.markers.clearLayers();

    const actualZoom = this.map.getZoom();
    const isHighZoom = actualZoom >= this.HIGH_ZOOM_THRESHOLD;

    clusters.forEach(cluster => {
      if (cluster.centerLatitude && cluster.centerLongitude) {
        if (isHighZoom && cluster.videoCount === 1) {
          // Visoki zoom i samo 1 video - prikazi kao obican marker
          this.addVideoMarker(cluster.representativeVideo);
        } else {
          // Niski/srednji zoom ILI klaster sa vise videa - uvek prikazi kao klaster
          this.addClusterMarker(cluster);
        }
      }
    });
  }

  private addClusterMarker(cluster: TileCluster): void {
    const clusterIcon = this.createClusterIcon(cluster.videoCount);
    const marker = L.marker(
      [cluster.centerLatitude, cluster.centerLongitude],
      { icon: clusterIcon }
    );

    const video = cluster.representativeVideo;
    const popupContent = `
       <div style="text-align:center">
         <div style="background:#3388ff; color:white; padding:5px; border-radius:4px; margin-bottom:8px;">
           <b>${cluster.videoCount} video snimaka u ovoj oblasti</b>
         </div>
         <div style="border-top:1px solid #ddd; padding-top:8px;">
           <small>Najpopularniji:</small><br>
           <b>${video.title}</b><br>
           <img src="${environment.apiUrl}/uploads/${video.thumbnailUrl}" style="width:100px; margin-top:5px;"><br>
           <small>${video.viewCount} pregleda</small>
         </div>
       </div>
    `;

    marker.bindPopup(popupContent);
    this.markers.addLayer(marker);
  }

  private addVideoMarker(video: Video): void {
    if (video.latitude && video.longitude) {
      const marker = L.marker([video.latitude, video.longitude]);

      const popupContent = `
         <div style="text-align:center">
           <b>${video.title}</b><br>
           <img src="${environment.apiUrl}/uploads/${video.thumbnailUrl}" style="width:100px; margin-top:5px;">
         </div>
      `;

      marker.bindPopup(popupContent);
      this.markers.addLayer(marker);
    }
  }

  private createClusterIcon(count: number): L.DivIcon {
    // Velicina ikone zavisi od broja videa u klasteru
    let size = 40;
    let fontSize = 12;

    if (count >= 100) {
      size = 50;
      fontSize = 14;
    } else if (count >= 10) {
      size = 45;
      fontSize = 13;
    }

    return L.divIcon({
      html: `<div style="
        background-color: #3388ff;
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fontSize}px;
        font-weight: bold;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: 'cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
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

  /**
   * Crta tile grid mrezu na mapi.
   * Prikazuje efektivne tile granice koje se koriste za klasterizaciju.
   */
  private drawTileGrid(): void {
    this.gridLayer.clearLayers();

    const zoom = this.map.getZoom();
    const effectiveZoom = this.getEffectiveZoom(zoom);
    const bounds = this.map.getBounds();

    // Izracunaj tile koordinate za vidljivi dio mape
    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    const minTileX = this.lonToTileX(nw.lng, effectiveZoom);
    const maxTileX = this.lonToTileX(se.lng, effectiveZoom);
    const minTileY = this.latToTileY(nw.lat, effectiveZoom);
    const maxTileY = this.latToTileY(se.lat, effectiveZoom);

    // Stil za grid linije
    const gridStyle = {
      color: 'white',
      weight: 1,
      opacity: 0.6,
      dashArray: '5, 5'
    };

    // Crtaj vertikalne linije (po longitude)
    for (let x = minTileX; x <= maxTileX + 1; x++) {
      const lng = this.tileXToLon(x, effectiveZoom);
      const line = L.polyline([
        [85, lng],   // Od vrha
        [-85, lng]   // Do dna
      ], gridStyle);
      this.gridLayer.addLayer(line);
    }

    // Crtaj horizontalne linije (po latitude)
    for (let y = minTileY; y <= maxTileY + 1; y++) {
      const lat = this.tileYToLat(y, effectiveZoom);
      const line = L.polyline([
        [lat, -180],  // Od lijevo
        [lat, 180]    // Do desno
      ], gridStyle);
      this.gridLayer.addLayer(line);
    }

  }

  private getEffectiveZoom(actualZoom: number): number {
    if (actualZoom >= this.HIGH_ZOOM_THRESHOLD) {
      return actualZoom;
    } else if (actualZoom >= this.MEDIUM_ZOOM_THRESHOLD) {
      return this.EFFECTIVE_ZOOM_MEDIUM;
    } else {
      return this.EFFECTIVE_ZOOM_LOW;
    }
  }

  // Tile koordinatne konverzije
  private lonToTileX(lon: number, zoom: number): number {
    return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
  }

  private latToTileY(lat: number, zoom: number): number {
    const latRad = lat * Math.PI / 180;
    return Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
  }

  private tileXToLon(x: number, zoom: number): number {
    return x / Math.pow(2, zoom) * 360 - 180;
  }

  private tileYToLat(y: number, zoom: number): number {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }
}