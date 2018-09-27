module.exports = function(MongoClient, dbURL){
    this.MongoClient = MongoClient;
    this.dbURL = dbURL;

    this.addGroup = function(group, res){
        this.MongoClient.connect(this.dbURL, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            
            // Add student
            dbo.collection("groups").insertOne(group, function(err, result) {
                if (err) throw err;
                console.log("Added new group: " + group.name);
                res.send(true);
                db.close();
            });
        });
    }

    this.addChannel = function(channel, res){
        this.MongoClient.connect(this.dbURL, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            
            // Add student
            dbo.collection("channels").insertOne(channel, function(err, result) {
                if (err) throw err;
                console.log("Added new channel: " + channel.name);
                res.send(true);
                db.close();
            });
        });
    }

    this.addUser = function(user, res){
        this.MongoClient.connect(this.dbURL, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            
            // Add student
            dbo.collection("users").insertOne(user, function(err, result) {
                if (err) throw err;
                console.log("Added new user: " + user.name);
                res.send(true);
                db.close();
            });
        });
    }
    



    return this;
}