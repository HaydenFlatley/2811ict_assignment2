// ============================================
// This module handles the login according to
// the data that is presented.
// ============================================

module.exports = function(MongoClient, dbURL){
    this.findUserLogin = function(username, password){
        return MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");
            return dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                console.log("GOT HERE");
                if (err) throw err;
                let match = false;
                if (result[0].password == password){
                    match = {
                        "name": data[0].name,
                        "permissions": data[0].permissions,
                        "groups": [],
                    }
                    console.log("Password correct!");
                }else{
                    console.log("Password WRONG");
                }
                console.log("MATCH", match);
                return match;
            });
        });

    }

    this.findUser = function(username){
        let match = false;
        let users = data;

        MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            let dbo = db.db("chat");
            dbo.collection("users").find({}).toArray(function(err, result) {
                //console.log("GOT THE USERS: ",result);
                for(let i = 0; i < result.length; i++){
                    if(result[i].name == username){
                        match = result[i];
                    }
                }
             });
            
            console.log("DFNSKJLVNDJKVLNDSJKV",match);
            return match;

       });

        
    }

    this.setUserData = function(data){
        this.data = data;
    }

    return this;
}