// ============================================
// This module is responsible for joining the user's 
// groups and channels according to the user's 
// responsibilities
// ============================================
module.exports = function(MongoClient, dbURL){
    //this.MongoClient = MongoClient;
    //this.dbURL = dbURL;
    this.username;
    this.groupData;
    
    // Find and delete a group by matching groupName to available data in this.data
    this.deleteGroup = function(groupName){
        let found = false;
        //console.log(this.data);
        for(let i = 0; i < this.groupData.length; i++){
            if(this.groupData[i].name == groupName){
                found = true;
                this.groupData.splice(i, 1);
                return this.groupData
            }
        }
        return found;
    }

    // Return all groups where the username exists (or according to role)
    this.getGroups = function(username, res, role = 0){
        MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            console.log("USERNAMEMMMEME", username);
            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                this.groupData = result[0];
                console.log(this.groupData);
                let groups = [];
                role = 2;
                if(role == 2){
                    // Just return every group and every channel
                    for(let i = 0; i < this.groupData.groups.length; i++){
                        let group = this.groupData.groups[i];
                        console.log("getting channels");
                        group.channels = this.groupData.groups[i].channels;
                        group.role = 0;
                        console.log("NEW GROUP", group)
                        groups.push(group);
                    }
                // } else {   
                //     // Check for group admin
                //     for(let i = 0; i < data.length; i++){
                //         let admins = data[i].admins;
                //         for(let j = 0; j < admins.length; j++){
                //             if(username == admins[j]){
                //                 data[i].role = 1;
                //                 groups.push(data[i]);
                //             }
                //         }
                //     }

                //     // Check for membership
                //     for(let i = 0; i < data.length; i++){
                //         let members = data[i].members;
                //         for(let j = 0; j < members.length; j++){
                //             if(username == members[j]){
                //                 data[i].role = 0;
                //                 groups.push(data[i]);
                //             }
                //         }
                //     }

                //     // Grab the channels for each group
                //     for(let i = 0; i < groups.length; i++){
                //         let channels = getChannels(username, groups[i], groups[i].permissions);
                //         groups[i].channels = channels;
                //     }
                }
                console.log("from get groups", groups);
                res.send(groups);

            });

            


    
        });
        
    }

    // Get all the channels a user has access for a given group and role
    this.getChannels = function(username, group, res){
        MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            console.log("USERNAMEMMMEME", username);
            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                this.groupData = result[0];
                console.log('from getting channels', this.groupData);
                let channels = [];
                role = 2;
                // Go through all the channels
                for(let i = 0; i < this.groupData.groups.length; i++){
                    //remove later
                    // Check to see if the channel matches the current group
                    if(this.groupData.groups[i].name == group){
                        //TEMPRORARY
                        role = 2;
                        if(role >= 2 || group.role >= 1){
                            channels.push(this.groupData.groups[i].channels);
                        } else {
                            // Channel belongs to group, check for access
                            let channel = this.groupData.groups[i].channels;
                            for(let j = 0; j < channel.members.length; j++){
                                if(username == channel.members[j]){
                                    channels.push(channel);
                                }
                            }
                        }
                    }
                }
                console.log("CHANNELS LIST", channels);

                res.send(channels);
            });
        });
    }
    return this;
}