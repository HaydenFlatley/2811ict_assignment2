module.exports = function(MongoClient, dbURL){
    this.MongoClient = MongoClient;
    this.dbURL = dbURL;

    this.addGroup = function(username, group, res){
        this.MongoClient.connect(this.dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            let updatedUser;
            
            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                updatedUser = result[0];
                group.admins.push(username);
                updatedUser.groups.push(group);
                dbo.collection("users").updateOne({'name':username},{$set:{"groups":updatedUser.groups}}, function(err, result) {
                    if (err) throw err;
                    res.send(true);
                    db.close();
                });
            });
            
            //
            // Add student
            
            

        });
    }

    this.addChannel = function(channel, groupname, username, res){
        this.MongoClient.connect(this.dbURL, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            
            // Add student
            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                updatedUser = result[0];
                console.log("NEW CHANNEL", channel);
                for (let i = 0; i < updatedUser.groups.length; i++){
                    if (updatedUser.groups[i].name == groupname){
                        updatedUser.groups[i].channels.push(channel);
                    }
                }
                if (err) throw err;
                dbo.collection("users").updateOne({'name':username},{$set:{"groups":updatedUser.groups}}, function(err, result) {
                    if (err) throw err;
                    res.send(true);
                    db.close();
                });
            });
        });
    }

    this.addUser = function(user, res){
        this.MongoClient.connect(this.dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");

            dbo.collection("users").find({'name':user.name}).toArray(function(err, result) {
                updatedUser = result[0];
                if (updatedUser == undefined){
                    // Add new user
                    dbo.collection("users").insertOne(user, function(err, result) {
                        if (err) throw err;
                        console.log("Added new user: " + user);
                        res.send(true);
                        db.close();
                    });
                }else{
                    console.log("this is user", user);
                    let found = false;
                    for (let i = 0; i < updatedUser.groups.length; i++){
                        if (updatedUser.groups[i].name == user.groups[0].name){
                            updatedUser.groups[i].channels.push(user.groups[0].channels[0]);
                            found = true;
                        }
                    }
                    if (found == false){
                        updatedUser.groups.push(user.groups[0]);
                    }
                    console.log("UPDATED USER", updatedUser);
                    if (err) throw err;
                    dbo.collection("users").updateOne({'name':user.name},{$set:{"groups":updatedUser.groups}}, function(err, result) {
                        if (err) throw err;
                        res.send(true);
                        db.close();
                    });

                }
                
            });
            
            
        });
    }
    



    return this;
}