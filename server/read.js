module.exports = function(MongoClient, dbURL){
    this.MongoClient = MongoClient;
    this.dbURL = dbURL;

    this.users;

    this.getGroups = function(res){
        this.MongoClient.connect(this.dbURL, function(err, db){
            if(err) throw err;
            
            let dbo = db.db("chat");
            dbo.collection("groups").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
            });
        });
    }

    this.getUsers = function(res){
        let ret;
        this.MongoClient.connect(this.dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            dbo.collection("users").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            ret = result;
            return result;
            res.send(result);
            db.close();
            });
        });
        return ret;
    } 

    return this;
}