var express = require('express'),
    CronJob = require('cron').CronJob,
    kue = require('kue'),
    queue = kue.createQueue(),
    fs = require('fs'),
    readline = require('readline'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library'),
    app = express();

require('dotenv').config();

var SCOPES = ['https://www.googleapis.com/auth/gmail.compose'],
    TOKEN_DIR = (process.env.TOKEN_DIR) + '/.credentials/',
    TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';




app.get('/sendmail', function(req, res) {

    new CronJob('0 18 12 11 3 *', function() {
          fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
            console.log('Error loading client secret file: ' + err);
            res.send(err) ;
          }
          // Authorize a client with the loaded credentials, then call the
          // Gmail API.
          // console.log(JSON.parse(content));
            var credentials = JSON.parse(content)
            var clientSecret = credentials.web.client_secret;
            var clientId = credentials.web.client_id;
            var redirectUrl = credentials.web.redirect_uris[0];
            var auth = new googleAuth();
            var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, function(err, token) {
              if (err) {
                console.log('you dont have any token');
                // getNewToken(oauth2Client, callback);
              } else {
                oauth2Client.credentials = JSON.parse(token);
                var job = queue.create('email', {
                  title: 'welcome email from fucking cron',
                  to: 'andra.satria1@gmail.com',
                  content: 'wassaaaah dude'
                }).save()

                queue.process('email', function(job,done) {
                  email(job.data ,oauth2Client, function(err, results) {
                    if (err) {
                      res.send(err);
                    } else {
                      res.send(results);
                    }
                  });
                })


              }
            });

        });

      // console.log('You will see this message every second');
    }, null, true, 'Asia/Jakarta');



})


app.get('/callback', function(req,res) {
  res.json(req.query.code)
})


function email(data, auth, cb) {
    var gmailClass = google.gmail('v1');

    var email_lines = [];

    email_lines.push('From: "test" <anthonyjuan95@gmail.com>');
    email_lines.push(`To: ${data.to}`);
    email_lines.push('Content-type: text/html;charset=iso-8859-1');
    email_lines.push('MIME-Version: 1.0');
    email_lines.push(`Subject: ${data.title}`);
    email_lines.push('');
    email_lines.push(`${data.content}`);

    var email = email_lines.join('\r\n').trim();

    var base64EncodedEmail = new Buffer(email).toString('base64');
    base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

    gmailClass.users.messages.send({
      auth: auth,
      userId: 'me',
      resource: {
        raw: base64EncodedEmail
      }
    }, cb);
  }



app.listen(3000, function() {
  console.log('server is running');
})
