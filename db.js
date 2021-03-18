var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/UnityData'


if(process.env.NODE_ENV === 'production'){
    dbURI = dbURI;
}

mongoose.connect(dbURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.Promise = Promise;

mongoose.connection.on('connected', function(){
    console.log("Mongoose connected to " + dbURI);
})