import { Video } from './video.model';

export interface TileCluster {
  centerLatitude: number;
  centerLongitude: number;
  videoCount: number;
  representativeVideo: Video;
  tileX: number;
  tileY: number;
  tileZ: number;
  cluster: boolean;
}
