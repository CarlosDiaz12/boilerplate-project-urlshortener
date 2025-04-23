require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns');
const url = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;
const urls = [];
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  const urlReq = req.body.url;
  const parsedLookupUrl = new URL(urlReq);

  dns.lookup(parsedLookupUrl.hostname, (err, data, family) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      let shortUrl = data ? data.split(':')[0] : family;
      if (shortUrl == 0)
        shortUrl = Math.floor(Math.random() * 1000)

      const result = urls.find(x => x.short_url == shortUrl);
      if (result) {
        res.json(result);
      } else {
        const newUrl = { short_url: +shortUrl, original_url: urlReq };
        urls.push(newUrl);

        res.json(newUrl);
      }
    }

  })
});


app.get('/api/shorturl/:short', function (req, res) {
  const urlReq = req.params.short;

  const findUrl = urls.find(x => x.short_url == urlReq);
  if (findUrl) {
    res.redirect(findUrl.original_url);
  } else {
    res.json({ "error": "No short URL found for the given input" });
  }



});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
