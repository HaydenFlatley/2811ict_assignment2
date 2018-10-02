import { Component, OnInit, Input} from '@angular/core';
import {ChatService} from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() channel;
  user:any;
  messages:Array<{user:String,message:String}> = [];
  message:String;
  prevChannel: string;
  
  constructor(private _chatService:ChatService) { 
    this._chatService.newUserJoined().subscribe(data=> {
      this.messages.push(data);
      console.log("DADADADATA", data);
    });
    this._chatService.newMessageReceived().subscribe(data=> {
      if (this.channel.name != this.prevChannel){
        //channel has been changed
        this.messages = [];
      }
      this.messages.push(data);
      console.log("DADADADATA", data);
      this.prevChannel = this.channel.name;
    });
  }

  ngOnInit() {
    if(sessionStorage.getItem('user') === null){
      // User has not logged in, reroute to login
    } else {
      let user = JSON.parse(sessionStorage.getItem('user'));
      this.user = user;
    }
    console.log("USER IN CHAT: ",this.user);
  }

  sendMessage(){
    console.log("sending to", this.channel);
    this._chatService.sendMessage({user:this.user.name, room:this.channel.name, message:this.message});
  }

  

}
