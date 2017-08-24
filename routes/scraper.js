const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const request = require('request');

const mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_xvdv7d15:r0893gnorp23uvt6bnl6un2of9@ds147797.mlab.com:47797/heroku_xvdv7d15');

let Schema = mongoose.Schema;

let articleSchema = new Schema({
    title: String,
    onion: Boolean,
    comments: [{body: String, date: Date}]
});

let Articles = mongoose.model('Article', articleSchema);

router.get('/', function (req, res, next) {
    let $;
    request('https://www.reddit.com/r/nottheonion/', function (error, result, html) {
        if (!error && result.statusCode === 200) {
            $ = cheerio.load(html);

            $('p.title>a').slice(1).each(function (index, element) {
                let text =$(this).text().replace(/(\w)[\w']*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
                console.log(text);
                Articles.findOneAndUpdate({
                    title: text
                }, {
                    title: text,
                    onion: false
                }, {
                    upsert: true,
                    new: true
                }, function (error, doc) {
                    if (error) {
                        console.log(error)
                    }
                });
            });

            request('https://www.reddit.com/r/theonion/', function (error, result, html) {
                if (!error && result.statusCode === 200) {
                    $ = cheerio.load(html);

                    let text = $(this).text().replace(/(\w)[\w']*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

                    $('p.title>a').each(function (index, element) {
                        Articles.findOneAndUpdate({
                            title: text
                        }, {
                            title: text,
                            onion: true
                        }, {
                            upsert: true,
                            new: true
                        }, function (error, doc) {
                            if (error) {
                                console.log(error)
                            }
                        });
                    });
                    next();
                }
            });
        }
    });
});

router.get('/', function (req, res) {
    Articles.find({}, {onion: false}, {limit: 100}, function (err, articles) {
        if (err) {
            console.log(err)
        }
        for (let i = articles.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [articles[i - 1], articles[j]] = [articles[j], articles[i - 1]];
        }
        res.send(articles);
    })
});


router.post('/delete/:id', function(req, res){
    Articles.findOneAndUpdate({
            _id: req.params.id
        }, {
            $pull: {
                comments: {
                    _id: req.body.commentID
                }
            }
        }, {
            new: true
        },
        function (err, response) {
            res.json(response);
        })
});

router.post('/check/:id', function(req, res){
    Articles.findOne({
            _id: req.params.id
        },
        function (err, response) {
            console.log(response);
            let text;
            if(response.onion === true){
                text = "This is from The Onion!"
            } else {
                text = "This is from Not The Onion!"
            }
            if(response.onion.toString() === req.body.check){
                res.send(`Correct! ${text}`);
            } else {
                res.send(`Incorrect! ${text}`);
            }
        })
});


router.post('/add/:id', function (req, res) {
    console.log(req.params.id);
    Articles.findOneAndUpdate({
            _id: req.params.id
        }, {
            $push: {
                comments: {
                    body: req.body.comment,
                    date: new Date()
                }
            }
        }, {
            new: true
        },
        function (err, response) {
            res.json(response);
        })
});

module.exports = router;
