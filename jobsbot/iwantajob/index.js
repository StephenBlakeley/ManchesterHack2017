//employee
const twit = require('twit');
const config = require('./config.js');
const mongo = require('mongodb').MongoClient;
const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const ignored = ['hello','thanks','a','is','please','so','and','bye','cheers','it','its','it\'s','am','i','want','again','job','after','on', 'rt']; //TODO etc

// Connection URL
const url = 'mongodb://<DBURL>';

const Twitter = new twit(config);

mongo.connect(url, function(err, db) {
  if(err){
    console.log("err: "+err);
  }else{
    console.log("Connected correctly to server");

    let searchTerm = '#iwantajobuk';

    let params = {
        q: '#iwantajobuk',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    }
    let streamParams = {
      track: searchTerm
    }
    // for more parameters, see: https://dev.twitter.com/rest/reference/get/search/tweets
    let stream = Twitter.stream('statuses/filter',streamParams);

    console.log('Streaming: '+searchTerm);

    stream.on('tweet', function (tweet) {
      console.log(tweet.user.id + " " + tweet.user.screen_name + " tweeted: " + tweet.text);

      let text = tweet.text.toLowerCase();

      //location
       let startLoc = text.search(searchTerm);
       let loc = text.substring(startLoc);
       let endLoc = loc.substring(0, loc.search(" "));
       let location = endLoc.substring(endLoc.search("-")+1);

       //remove #tag
       let words = text.split(' ');
       let skills = [];
       let daysAvailable = [];

       words.forEach(word => {
         if(!word.startsWith('#')){ //TODO change to switch case
           if (isADay(word)) {
             daysAvailable.push(word);
           }else if (isNotIgnored(word)){
             skills.push(word);
           }else{
             //do nothing
             //console.log("other word: "+word);
           }
         }
       })

      let collection = db.collection('jobseekers');
      jobwanted = {};
      jobwanted.twitterUserId = tweet.user.id;
      jobwanted.twitterUser = tweet.user.screen_name;
      jobwanted.tweetId = tweet.id;
      jobwanted.skills = skills;
      jobwanted.daysAvailable = daysAvailable;
      jobwanted.location = location;
      jobwanted.contacted = false;

      collection.insertOne(jobwanted);

      //tweet them back
      var tweet = { in_reply_to_status_id: jobwanted.tweetId,
                  status: '@'+jobwanted.twitterUser+' thank you! I\'ll try to find you a job.' }

      Twitter.post('statuses/update', tweet, tweeted);

      function tweeted(err, data, response) {
        if(err){
          console.log("Something went wrong!"+JSON.stringify(err));
        }
        else{
          console.log("Auto reply sent! : "+ JSON.stringify(tweet));
        }
      }
    });
  }
});

function isADay(word){

  if (daysOfWeek.indexOf(word) > -1) return true;

  return false;
}

function isNotIgnored(word){

  if (ignored.indexOf(word) > -1) return false;

  return true;
}
