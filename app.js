var shortid = require('shortid')
var express = require('express')
var app = express()
var path = require('path');
var server = require('http').Server(app)
var io = require('socket.io')(server,{})
var mongoose = require('mongoose')

require('./db.js')

//Data model
var User = mongoose.model('User',{
    playername:{
        type:String
    },
    score:{
        type:Number
    },
    gamesplayed:{
        type:Number
    }
})


app.use(express.urlencoded({extended:true}))
app.use(express.json())

//build a route for the index page
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.use(express.static(__dirname + '/views'));

//Get Route to get data from database
app.get('/download', function(req,res){
    User.find({}).then(function(data){
        res.json({data})
    })
})


app.post('/deleteGame',function(req,res){
    console.log("Data Deleted", req.body._id);
    User.findByIdAndDelete(req.body._id).exec()
    res.redirect('/views/editdata.html');
});

//Post route to save data from Unity
app.post("/upload", function(req,res){
    console.log("Posting Data")

    //Create new instance of the model
    var newUser = new User({
        playername:req.body.playername,
        score:req.body.score,
        gamesplayed:req.body.gamesplayed
    })

    newUser.save(function(err,result){
        if(err){
            console.log(err);
        } else {
            console.log(result);
        }
    })
})



server.listen(3000, function(){
    console.log("App running on port 3000")
})


//Socket server code ----------------

console.log('server is running')

var players = []

io.on('connection', function(socket) {
    console.log("client connected")

    var clientId = shortid.generate()
    players.push(clientId)

    socket.broadcast.emit('spawn', { id: clientId })

    //request all existing player positions
    socket.broadcast.emit('requestPosition');

    /*for(var i = 0; i < players.length; i++) {
        if (playerId == clientId) {
            return
        }

        socket.emit('spawn')
        console.log("sending spawn")
    }*/

    socket.on('hello', function(data) {
        console.log("hello from the connected client")
    })

    players.forEach(function(client){
        if(client == clientId){
            return;
        }
        socket.emit('spawn',{id:client})
        console.log("sending spawn to new player", client);
    })

    socket.on('move', function(data) {
        data.id = clientId
        console.log("getting position from client")
        console.log(data)
        socket.broadcast.emit('move',data)
    })

    socket.on('updatePosition', function(data) {
        data.id = clientId
        socket.broadcast.emit('updatePosition', data)

    })

    

    socket.on('disconnected', function(){
        console.log("player has disconnected")
        players.splice(players.lastIndexOf(clientId),1)
        socket.broadcast.emit('disconnected', {id:clientId})
    })
 
}) 