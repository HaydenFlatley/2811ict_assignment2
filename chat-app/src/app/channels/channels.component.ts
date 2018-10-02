import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ChatService} from '../chat.service';

// import { EventEmitter } from 'events';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  @Input() channels;
  @Input() group;
  @Output() channelChanged: EventEmitter<string> = new EventEmitter();
  user:any;
  prevRoom: string;


  constructor(private _chatService:ChatService) { }

  ngOnInit() {
    if(sessionStorage.getItem('user') === null){
      // User has not logged in, reroute to login
    } else {
      let user = JSON.parse(sessionStorage.getItem('user'));
      this.user = user;
    }
    
  }

  changeChannel(name){
    // console.log("changeChannel("+name+")");
    this.channelChanged.emit(name);

    this.join(name);
  }

  join(channelName){
    this.leave();
    this._chatService.joinRoom({user:this.user.name, room:channelName.name});
    this.prevRoom = channelName.name;
  }

  leave(){
    if (this.prevRoom != undefined){
      this._chatService.leaveRoom({user:this.user.name, room:this.prevRoom});
    }
    
  }

}
