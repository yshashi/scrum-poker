import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-room',
  template: `
    <h2>Room: {{ roomId }}</h2>
    <div>
      <h3>Users:</h3>
      <ul>
        <li *ngFor="let user of users">{{ user }}</li>
      </ul>
    </div>
    <div>
      <h3>Voting:</h3>
      <button *ngFor="let value of voteValues" (click)="vote(value)">{{ value }}</button>
    </div>
    <div *ngIf="isAdmin">
      <button (click)="revealVotes()">Reveal Votes</button>
      <button (click)="resetVotes()">Reset Votes</button>
    </div>
    <div *ngIf="votesRevealed">
      <h3>Results:</h3>
      <ul>
        <li *ngFor="let vote of votes | keyvalue">{{ vote.key }}: {{ vote.value }}</li>
      </ul>
    </div>
  `,
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId: string = '';
  users: string[] = [];
  votes: { [key: string]: string } = {};
  votesRevealed: boolean = false;
  isAdmin: boolean = false;
  voteValues: string[] = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.socketService.joinRoom(this.roomId, 'User'); // Replace 'User' with actual username
    this.isAdmin = true; // For simplicity, first user is admin

    this.socketService.onUserJoined().subscribe((users) => {
      this.users = users;
    });

    this.socketService.onUpdateVotes().subscribe((votes) => {
      this.votes = votes;
    });

    this.socketService.onVotesRevealed().subscribe((votes) => {
      this.votes = votes;
      this.votesRevealed = true;
    });

    this.socketService.onVotesReset().subscribe(() => {
      this.votes = {};
      this.votesRevealed = false;
    });
  }

  ngOnDestroy() {
    this.socketService.leaveRoom(this.roomId);
  }

  vote(value: string) {
    this.socketService.vote(this.roomId, value);
  }

  revealVotes() {
    this.socketService.revealVotes(this.roomId);
  }

  resetVotes() {
    this.socketService.resetVotes(this.roomId);
  }
}