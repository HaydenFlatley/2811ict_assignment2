const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express(); 
const fs = require('fs');
const dataFile = './data.json';
const dataFormat = 'utf8';
const MongoClient = require('mongodb').MongoClient;
const dbURL = "mongodb://localhost:27017/chat"; 


// CORS
// We are enabling CORS so that our 'ng serve' Angular server can still access
// our Node server. 
const cors = require('cors')
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions))



// Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Routes
app.use(express.static(path.join(__dirname, '../angular-app/dist/angular-app')));
app.get('/', function (req, res) {
    console.log("Setting up initial db state");
    MongoClient.connect(dbURL, function(err, db){
        if(err) throw err;
        console.log("SUCCESS: connected to db");
        let dbo = db.db("chat");

        // Drop collection
        dbo.collection("groups").drop(function(err, delOk){
            if(err) {
                console.log("ERROR: failed drop collection groups");
                if(verbose) console.log(err)
            };
            if(delOk) console.log("SUCCESS: dropped collection groups");
        });

        // Create collection
        dbo.createCollection("groups", function(err, res){
            if(err){
                console.log("ERROR: failed create collection groups");
                if(verbose) console.log(err);
            }
            console.log("SUCCESS: Created collection groups");
        });

        let data = [    
            {"name":"Griffith Innovate","admins":["ryoma"],"members":["member1","group"]}
        ]

        dbo.collection("groups").insertMany(data, function(err, res){
            if(err) throw err;
            console.log("Inserted " + res.insertedCount + " documents to groups");
        });

        // Check data
        dbo.collection("groups").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });


        db.close();

    });
    res.sendFile(path.join(__dirname,'../angular-app/dist/angular-app/index.html'))
});
app.get('/home', function(req,res){
    res.sendFile(path.join(__dirname,'../angular-app/dist/angular-app/index.html'))
});

app.get('/db/install', function(req, res){
    console.log("Setting up initial db state");
    MongoClient.connect(dbURL, function(err, db){
        if(err) throw err;
        console.log("SUCCESS: connected to db");
        let dbo = db.db("chat");

        // Drop collection
        dbo.collection("groups").drop(function(err, delOk){
            if(err) {
                console.log("ERROR: failed drop collection groups");
                if(verbose) console.log(err)
            };
            if(delOk) console.log("SUCCESS: dropped collection groups");
        });

        // Create collection
        dbo.createCollection("groups", function(err, res){
            if(err){
                console.log("ERROR: failed create collection groups");
                if(verbose) console.log(err);
            }
            console.log("SUCCESS: Created collection groups");
        });

        let data = [    
            {"name":"Griffith Innovate","admins":["ryoma"],"members":["member1","group"]}
        ]

        dbo.collection("groups").insertMany(data, function(err, res){
            if(err) throw err;
            console.log("Inserted " + res.insertedCount + " documents to groups");
        });

        // Check data
        dbo.collection("groups").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });


        db.close();

    });
});

// Login Module
const login = require('./login.js')();
const groups = require('./groups.js')(MongoClient, dbURL);
const users = require('./users.js')();

app.post('/api/login', function(req, res){
        MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            let username = req.body.username; 
            let password = req.body.password;
            if(err) throw err;
            let dbo = db.db("chat");
            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
            if (err) throw err;
            data = result;
            db.close();
            login.data = data;

            let match = false;
            if (data[0].password == password){
                match = {
                    "name": data[0].name,
                    "permissions": data[0].permissions,
                }
                console.log("Password correct!");
            }else{
                console.log("Password WRONG");
            }

            if(match !== false){
                groups.getData();
                match.groups = groups.getGroups(username, match.permissions);
                //console.log(match.groups[0].channels[0]);
            }
            console.log("MATCH IS ",match);
           
            res.send(match);

            });
        });
        
        //
});


// Group APIs
app.post('/api/groups', function(req,res){
    // We want to authenticate again -- usually you'd use a token
    fs.readFile(dataFile, dataFormat, function(err, data){
        data = JSON.parse(data);
        let username = req.body.username; 
        login.data = data;
        let match = login.findUser(username);
        
        // Check to see if we got a match, get groups if true
        if(match !== false){
            groups.data = data;
            match.groups = groups.getGroups(username, match.permissions);
        }
        res.send(match);
    });
});

app.post('/api/channels', function(req,res){
    // We want to authenticate again -- usually you'd use a token
    fs.readFile(dataFile, dataFormat, function(err, data){
        data = JSON.parse(data);
        let username = req.body.username;
        let group = req.body.group; 
        login.data = data;
        let match = login.findUser(username);
        console.log(data);
        // Check to see if we got a match, get groups if true
        if(match !== false){
            console.log("Match"+match.username);
            groups.data = data;
            match.channels = groups.getChannels(username, group, match.permissions);
        }
        res.send(match);
    });
});

app.delete('/api/group/delete/:groupname', function(req, res){
    let groupName = req.params.groupname;

    // Read the JSON file to get the current data
    fs.readFile(dataFile, dataFormat, function(err, data){
        let readData = JSON.parse(data);
        groups.data = readData.groups;
        readData.groups = groups.deleteGroup(groupName);
        console.log(readData);
        let json = JSON.stringify(readData);

        // Write the updated data to JSON
        fs.writeFile(dataFile, json, dataFormat, function(err, d){
            res.send(true);
            console.log("Deleted group: " + groupName);
        });
    });
});

app.post('/api/group/create', function(req, res){
    let writer = require('./write.js')(MongoClient, dbURL);
    let groupName = req.body.newGroupName;
    if(groupName == '' || groupName == 'undefined' || groupName == null){
        res.send(false);
    } else {
            let newGroup = {
                'name': req.body.newGroupName,
                'admins':[],
                'members':[]
            }
            writer.addGroup(newGroup, res);
    }
})

app.post('/api/channel/create', function(req, res){
    let writer = require('./write.js')(MongoClient, dbURL);
    let channelName = req.body.newChannelName
    if(channelName == '' || channelName == 'undefined' || channelName == null){
        res.send(false);
    } else {
            let newChannel = {
                'name': req.body.newChannelName,
                'group': req.body.groupName,
                'members':[]
            }
            writer.addChannel(newChannel, res);
    }
})


app.post('/api/user/create', function(req, res){
    let writer = require('./write.js')(MongoClient, dbURL);
    let username = req.body.username;
    let group = req.body.group;
    let channel = req.body.channel;
    if(username == '' || username == 'undefined' || username == null){
        res.send(false);
    } else {
            let newUser = {
                'name': username,
                'group': group,
                'channel': channel,
                'permissions': 0,
                'password': '123',
            }
            writer.addUser(newUser, res);
    }

});
 


// HTTP Listener
app.listen(3000, function(){
    console.log('Server runing');
})
module.exports = app;