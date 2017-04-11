var CronJob = require('cron').CronJob,
    kue = require('kue'),
    queue = kue.createQueue();

module.exports =

new CronJob('* * * * * *', function() {

  var job = queue.create('emailnow', {
    title: 'welcome email',
    to: 'anthonyjuan95@gmail.com',
    template: 'wassaaaah dude'
  }).save( function(err) {
    if(!err) console.log(job.id);
  })


  // console.log('You will see this message every second');
}, null, true, 'Asia/Jakarta');



