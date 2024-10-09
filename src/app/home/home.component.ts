import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-home',
  template: `
    <h2>Welcome to Scrum Poker Planner</h2>
    <button (click)="createRoom()">Create New Room</button>
    <div>
      <input [(ngModel)]="roomId" placeholder="Enter Room ID">
      <input [(ngModel)]="username" placeholder="Enter Your Name">
      <button (click)="joinRoom()" [disabled]="!roomId || !username">Join Room</button>
    </div>
  `,
})
export class HomeComponent {
  roomId: string = '';
  username: string = '';

  constructor(private router: Router, private socketService: SocketService) {}

  createRoom() {
    this.socketService.createRoom().then((roomId) => {
      this.router.navigate(['/room', roomId]);
    });
  }

  joinRoom() {
    if (this.roomId && this.username) {
      this.socketService.joinRoom(this.roomId, this.username);
      this.router.navigate(['/room', this.roomId]);
    }
  }
}