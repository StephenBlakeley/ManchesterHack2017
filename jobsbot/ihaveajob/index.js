//Employer
const twit = require('twit');
const config = require('./config.js');
const mongo = require('mongodb').MongoClient;
const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const ignored = ['hello','thanks','a','is','please','so','and','bye','cheers','it','its','it\'s','am','i','want','again','job','after','on', 'work', 'rt']; //TODO etc

// Connection URL
const url = 'mongodb://<DBURL>';

const Twitter = new twit(config);

mongo.connect(url, function(err, db) {
  if(err){
    console.log("err: "+err);
  }else{
    console.log("Connected correctly to server");

    let searchTerm = '#iofferajobuk';

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
           console.log(word);
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

      let collection = db.collection('jobs');
      job = {};
      job.twitterUserId = tweet.user.id;
      job.tweetId = tweet.id;
      job.twitterUser = tweet.user.screen_name;
      job.skills = skills;
      job.daysAvailable = daysAvailable;
      job.location = location;
      job.filled = false;

      let id = collection.insertOne(job);

      //tweet them back
      var tweet = {in_reply_to_status_id: job.tweetId,
                  status: '@'+job.twitterUser+' thank you for posting job!!, I\'ll try to find someone for you.'}

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
