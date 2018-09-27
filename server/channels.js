// ============================================
// This module is responsible for joining the user's 
// groups and channels according to the user's 
// responsibilities
// ============================================
module.exports = function(){
    this.username;
    this.data;
    
    // Get all the channels a user has access for a given group and role
    this.getChannels = function(username, group, role){
        channels = [];
        // Go through all the channels
        for(let i = 0; i < data.channels.length; i++){
            // Check to see if the channel matches the current group
            if(data.channels[i].group == group.name){
                if(role >= 2 || group.role >= 1){
                    channels.push(data.channels[i]);
                } else {
                    // Channel belongs to group, check for access
                    let channel = data.channels[i];
                    for(let j = 0; j < channel.members.length; j++){
                        if(username == channel.members[j]){
                            channels.push(channel);
                        }
                    }
                }
            }
        }


        return channels;
    }

    
    return this;
}