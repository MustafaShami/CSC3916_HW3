/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

//I Don't think I need for this assignment because we want data from request body
function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code === 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

/** TODO
 * Make movies routes go through database using the movie schema
 */
router.route('/movies')
    //Enter Movie Information
    .post(authJwtController.isAuthenticated, function (req, res) {
        if(!req.body.title || !req.body.year || !req.body.genre || !req.body.actors)// Check to make sure all necessary information was included
        {
            res.status(400).json({success: false, message: 'Not enough information to save a movie. Include title, year released' +
                                                                          ' genre, and 3 actors'});
        }
        else
        {
            var newMovie = new Movie(); //create new movie object and then assign it value from the request body
            newMovie.title = req.body.title;
            newMovie.year = req.body.year;
            newMovie.genre = req.body.genre;
            newMovie.actors = req.body.actors;

            //save the new movie and check to make sure it was saved sucessfully
            newMovie.save(function(err)
            {
                if(err)
                {
                    if (err.code === 11000)
                    {return res.json({ success: false, message: 'A Movie with that title already stored.'});}
                    else
                    {return res.json(err);}
                }
                else
                {
                    return res.status(200).json({success:true , message:'Movie Saved!'});
                }
            })
        }
        }
    )

    //Update Movie Information
    .get(authJwtController.isAuthenticated, function (req, res) {
        // console.log(req.body);
        // if (req.get('Content-Type')) {
        //     res = res.type(req.get('Content-Type'));
        // }
        Movie.find().exec(function (err, movies) //get movies from database
        {
            if(err) //check if error while getting movies from database
            {
                return res.json(err);
            }
            if(movies.length === 0) //check if there are any movies in the database
            {
                res.status(204).json({success:false , message:'There are no movies in the database.'});
            }
            else if(movies.length >= 1)
            {   //return the list of movies
                res.status(200).json({success:true , message:'Here is all the movies in the database.' , movies})
            }
        })
    })
    // // Delete a Movie
    // .delete(authController.isAuthenticated, function (req, res) {
    //         var movieToDelete = new Movie;
    //
    //         console.log(req.body);
    //         res = res.status(200);
    //         if (req.get('Content-Type')) {
    //             res = res.type(req.get('Content-Type'));
    //         }
    //         var o = getJSONObjectForMovieRequirement(req);
    //         res.json(o);
    //     }
    // )
    //
    // //Update Movie
    // .put(authJwtController.isAuthenticated, function(req, res) {
    //         console.log(req.body);
    //         res = res.status(200);
    //         if (req.get('Content-Type')) {
    //             res = res.type(req.get('Content-Type'));
    //         }
    //         var o = getJSONObjectForMovieRequirement(req);
    //         res.json(o);
    //     }
    // )
    // // Get list of Movies
    // .get(function (req, res) {
    //         console.log(req.body);
    //         res = res.status(200);
    //         // if (req.get('Content-Type')) {
    //         //     res = res.type(req.get('Content-Type'));
    //         // }
    //         var o = getJSONObjectForMovieRequirement(res.status, 'GET MOVIES', req);
    //         res.json(o);
    //     }
    // );

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


