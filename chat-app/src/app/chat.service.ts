import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket;
  currentRoom: String;

  constructor() { 
    this.socket = io.connect('http://localhost:3000');
  }

  joinRoom(data){
    this.socket.emit('join',data);
  }

  setCurrentRoom(r){
    this.currentRoom = r;
  }

  getCurrentRoom(){
    return this.currentRoom;
  }

  newUserJoined(){
    let observable = new Observable<{user:String, message:String}>(observer=>{
      this.socket.on('new user joined', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });
    return observable;
  }

  leaveRoom(data){
    
  }

  sendMessage(data){
    this.socket.emit('message',data);
  }

  newMessageReceived(){
    let observable = new Observable<{user:String, message:String}>(observer=>{
      this.socket.on('new message', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });
    return observable;
  }

}
