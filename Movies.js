var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

var MovieSchema = new Schema({
    title: {String, required:true, index:{unique:true}},
    yearReleased: {String, required:true},
    genre:
        {
            String,
            required:true,
            enum: ["Action" , "Adventure" , "Comedy" , "Drama" , "Fantasy" , "Horror" , "Mystery" , "Thriller" , "Western"]
        },
    actors: //want to require 3 actors
    [
        {actorName: {String, required:true}, characterName:{String, required:true}},
        {actorName: {String, required:true}, characterName:{String, required:true}},
        {actorName: {String, required:true}, characterName:{String, required:true}}
    ]
});

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);
