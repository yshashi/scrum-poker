import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io();
  }

  createRoom(): Promise<string> {
    return new Promise((resolve) => {
      this.socket.emit('createRoom', resolve);
    });
  }

  joinRoom(roomId: string, username: string) {
    this.socket.emit('joinRoom', { roomId, username });
  }

  leaveRoom(roomId: string) {
    this.socket.emit('leaveRoom', roomId);
  }

  vote(roomId: string, vote: string) {
    this.socket.emit('vote', { roomId, vote });
  }

  revealVotes(roomId: string) {
    this.socket.emit('revealVotes', roomId);
  }

  resetVotes(roomId: string) {
    this.socket.emit('resetVotes', roomId);
  }

  onUserJoined(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on('updateUsers', (users: string[]) => {
        observer.next(users);
      });
    });
  }

  onUpdateVotes(): Observable<{ [key: string]: string }> {
    return new Observable((observer) => {
      this.socket.on('updateVotes', (votes: [string, string][]) => {
        observer.next(Object.fromEntries(votes));
      });
    });
  }

  onVotesRevealed(): Observable<{ [key: string]: string }> {
    return new Observable((observer) => {
      this.socket.on('votesRevealed', (votes: [string, string][]) => {
        observer.next(Object.fromEntries(votes));
      });
    });
  }

  onVotesReset(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('votesReset', () => {
        observer.next();
      });
    });
  }
}