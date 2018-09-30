import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { GroupService } from '../group.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public user;
  public selectedGroup;
  public selectedChannel;
  public groups = [];
  public channels = [];
  public newGroupName:String;
  public newChannelName:String;
  public newUserName:String;

  constructor(private router: Router, private _groupService:GroupService, private _userService:UserService) { }

  ngOnInit() {
    if(sessionStorage.getItem('user') === null){
      // User has not logged in, reroute to login
      this.router.navigate(['/login']);
    } else {
      let user = JSON.parse(sessionStorage.getItem('user'));
      this.user = user;
      console.log("FROM HOME",this.user);
      this.groups = user.groups;
      console.log("THIS GROUPS",this.groups);
      if(this.groups.length > 0){
        this.openGroup(this.groups[0].name);
        if(this.groups[0].channels > 0){
          this.channelChangedHandler(this.groups[0].channels[0].name);
        }
      }
    }
  }

  createGroup(event){
    event.preventDefault();
    let data = {'newGroupName': this.newGroupName};
    this._groupService.createGroup(data).subscribe(
      data => { 
        console.log(data);
        this.getGroups();

      },
      error => {
        console.error(error);
      }
    )
  }

  createChannel(event){
    event.preventDefault();
    let data = {'newChannelName': this.newChannelName, 'groupName': this.selectedGroup.name};
    this._groupService.createChannel(data).subscribe(
      data => { 
        console.log(data);
        this.getChannels(this.selectedGroup.name);
      },
      error => {
        console.error(error);
      }
    )
  }

  createUser(event){
    let data = {'username': this.newUserName, 'group': this.selectedGroup.name, 'channel': this.selectedChannel.name}
    this._userService.create(data).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
     );
  }

  deleteGroup(groupName){
    this._groupService.deleteGroup(groupName, this.user.username).subscribe(
      data=>{
        this.getGroups();
      }, error =>{
        console.error(error)
      }
    )
  }

  getGroups(){
    console.log("Getting groups");
    let data = {
      'username': JSON.parse(sessionStorage.getItem('user')).username
    }
    this._groupService.getGroups(data).subscribe(
      d=>{
        console.log('getGroups()');
        console.log(d);
        this.groups = d['groups'];
      }, 
      error => {
        console.error(error);
      }
    )
  }

  getChannels(groupName){
    console.log("Getting channels");
    let data = {
      'username': JSON.parse(sessionStorage.getItem('user')).username,
      'group': groupName
    }
    this._groupService.getChannels(data).subscribe(
      d=>{
        console.log('getChannels()');
        console.log(d);
        this.channels = d[0];
      }, 
      error => {
        console.error(error);
      }
    )
  }

  logout(){
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // Determine which group is currently selected and pass onto the child panel
  openGroup(name){
    for(let i = 0; i < this.groups.length; i++){
      if(this.groups[i].name == name){
        this.selectedGroup = this.groups[i];
      }
      this.getChannels(this.selectedGroup.name);
    }
  }



  // Responsible for handling the event call by the child component
  channelChangedHandler(name){

    let found:boolean = false;
    for(let i = 0; i < this.channels.length; i++){
      if(this.channels[i] == name){
        this.selectedChannel = this.channels[i];
        found = true;
      }
    }
    return found;
  }
  
}
