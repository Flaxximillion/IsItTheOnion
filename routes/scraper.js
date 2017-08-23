const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const request = require('request');

/* GET users listing. */
router.get('/', function (req, res, next) {
    let $;
    request('https://www.reddit.com/r/nottheonion/', function(error, result, html){
        if(!error && result.statusCode === 200){
            $ = cheerio.load(html);

            let titles = [];

            $('p.title>a').slice(1).each(function(index, element){
                console.log(index);
                titles.push({
                    id: 'nto_'+ index,
                    text: $(this).text()
                });
            });

            request('https://www.reddit.com/r/theonion/', function(error, result, html){
                if(!error && result.statusCode === 200){
                    $ = cheerio.load(html);

                    $('p.title>a').each(function(index, element){
                        console.log(index);
                        titles.push({
                            id: 'to_'+ index,
                            text: $(this).text()
                        });
                    });

                    for (let i = titles.length; i; i--) {
                        let j = Math.floor(Math.random() * i);
                        [titles[i - 1], titles[j]] = [titles[j], titles[i - 1]];
                    }

                    res.json(titles);
                }
            });
        }
    });
});

module.exports = router;
