import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { WatchParty } from '../models/watch-party.model';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WatchPartyService {

  private apiUrl = 'http://localhost:8080/api/watch-party';
  private wsUrl = 'http://localhost:8080/ws';

  private stompClient: Client | null = null;
  private videoPlaySubject = new Subject<number>();

  activeRoom: WatchParty | null = null;
  isCreator: boolean = false;

  constructor(private http: HttpClient) {}

  get inRoom(): boolean {
    return this.activeRoom !== null;
  }

  createRoom(): Observable<WatchParty> {
    return this.http.post<WatchParty>(this.apiUrl, {});
  }

  getRoomByCode(code: string): Observable<WatchParty> {
    return this.http.get<WatchParty>(`${this.apiUrl}/${code}`);
  }

  closeRoom(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`, { responseType: 'text' });
  }

  setActiveRoom(room: WatchParty, creator: boolean): void {
    this.activeRoom = room;
    this.isCreator = creator;
  }

  clearActiveRoom(): void {
    this.activeRoom = null;
    this.isCreator = false;
  }

  connect(roomCode: string): void {
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient!.subscribe(`/topic/watch-party/${roomCode}`, (message: IMessage) => {
          const body = JSON.parse(message.body);
          if (body.videoId) {
            this.videoPlaySubject.next(body.videoId);
          }
        });
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  sendPlayVideo(roomCode: string, videoId: number): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/watch-party/${roomCode}/play`,
        body: JSON.stringify({ videoId: videoId })
      });
    }
  }

  onVideoPlay(): Observable<number> {
    return this.videoPlaySubject.asObservable();
  }

  leaveAndClose(): void {
    if (this.activeRoom && this.isCreator) {
      this.closeRoom(this.activeRoom.roomCode).subscribe();
    }
    this.disconnect();
    this.clearActiveRoom();
  }
}
