const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express(); 
const fs = require('fs');
const dataFile = './data.json';
const dataFormat = 'utf8';
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const dbURL = "mongodb://localhost:27017/chat"; 
var server = require('http').Server(app);
var io = require('socket.io')(server);

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
app.use('./images',express.static(path.join(__dirname, './userImages')));

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
const login = require('./login.js')(MongoClient, dbURL);
const groups = require('./groups.js')(MongoClient, dbURL);
const users = require('./users.js')();

app.post('/api/login', function(req, res){
        let username = req.body.username; 
        let password = req.body.password;
        
        MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
            if(err) throw err;
            let dbo = db.db("chat");

            dbo.collection("users").find({'name':username}).toArray(function(err, result) {
                console.log(result);
                if (err) throw err;
                let data = result[0];
            
                let match = false;
                if (data.password == password){
                    match = data;
                    for (let i = 0; i < match.groups.length; i++){
                        match.groups[i].role = 0; 
                    }
                    groups.groupData = data;
                    console.log("Password correct!");
                }else{
                    console.log("Password WRONG");
                }


                console.log(match);
                
                res.send(match);
                
       });
    });

        
});

updateGroupData = function(username){
    MongoClient.connect(dbURL, { useNewUrlParser: true }, function(err, db){
        if(err) throw err;
        let dbo = db.db("chat");

        dbo.collection("users").find({'name':username}).toArray(function(err, result) {
            groups.groupData = result[0];
        });

    });
}


// Group APIs
app.post('/api/groups', function(req,res){
    
    let username = req.body.username;
    groups.getGroups(username, res);
});

app.post('/api/channels', function(req,res){
    let username = req.body.username;
    let group = req.body.group;
    groups.getChannels(username, group, res);
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
    let username = req.body.username;
    if(groupName == '' || groupName == 'undefined' || groupName == null){
        res.send(false);
    } else {
            let newGroup = {
                'name': req.body.newGroupName,
                'channels': [],
                'admins':[],
                'members':[]
            }
            writer.addGroup(username, newGroup, res);
    }
})

app.post('/api/channel/create', function(req, res){
    let writer = require('./write.js')(MongoClient, dbURL);
    let channelName = req.body.newChannelName;
    let groupName = req.body.groupName;
    let username = req.body.username;
    if(channelName == '' || channelName == 'undefined' || channelName == null){
        res.send(false);
    } else {
            let newChannel = {
                'name': channelName,
                'members':[username]
            }
            writer.addChannel(newChannel, groupName, username, res);
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
                'groups': [{"name":group, "channels": [{"name":channel, "members":[username]}]}],
                'permissions': 0,
                'password': '123',
            }
            writer.addUser(newUser, res);
    }

});
 


// HTTP Listener
server.listen(3000, function(){
    console.log('Server runing');
})


io.on('connection', (socket)=>{
    console.log("!!!!!!new connection made");

    socket.on('join', function(data){
        socket.join(data.room);
        console.log(data.user + 'joined the room: ' + data.room);
        socket.broadcast.to(data.room).emit('new user joined',{user:data.user, message:'has joined this room'});

    });

    socket.on('message', function(data){
        io.in(data.room).emit('new message', {user:data.user, message:data.message});

    });

    socket.on('leave', function(data){
        console.log(data.user + 'left the room: ' + data.room);
        socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room'});
        socket.leave(data.room);
    });

});

module.exports = app;