//matcher
const twit = require('twit');
const config = require('./config.js');
const mongo = require('mongodb').MongoClient;
const async = require('async');
const Twitter = new twit(config);
// Connection URL
const url = 'mongodb://<DBURL>';

var people;
var jobs;

function matchJobs(){
  mongo.connect(url, (err, db)=>{
    if (err) console.log(JSON.stringify(err))
    else{
      let jobCollection = db.collection('jobs');
      let peopleCollection = db.collection('jobseekers');

      //TODO aargh callback hell!
        var tasks = [
            // Load users
            function(callback) {
                jobCollection.find({}).toArray(function(err, res) {
                    if (err) return callback(err);
                    jobs = res;
                    callback();
                });
            },
            // Load colors
            function(callback) {
                peopleCollection.find({}).toArray(function(err, res) {
                    if (err) return callback(err);
                    people = res;
                    callback();
                });
            }
        ];

        async.parallel(tasks, function(err) { //This function gets called after the two tasks have called their "task callbacks"
            if (err) return next(err); //If an error occurred, let express handle it by calling the `next` function
            for(jobKey in jobs){
              let jobSkills = jobs[jobKey].skills;
              let job = jobs[jobKey];
              for(peopleKey in people){
                let personSkills = people[peopleKey].skills;
                let person = people[peopleKey];
                let match = true;
                // jobSkills.forEach(skill=>{
                //   if(personSkills.indexOf(skill) = -1) match = false; //TODO make it so you can be more flexible in skill matching e.g. mark must have skills with a !
                // });

                for (key in jobSkills){
                  let skill = jobSkills[key];
                  if(personSkills.indexOf(skill) == -1) match = false; //TODO make it so you can be more flexible in skill matching e.g. mark must have skills with a !
                }


                if(match) {
                  console.log("******************************************");
                  console.log("Job Skills: "+jobSkills);
                  console.log("People Skills: "+personSkills);
                  console.log("matched!");

                  //tweet them back
                  let skillsText = "";
                  for (skillKey in jobSkills){
                    skillsText = skillsText+jobSkills[skillKey]+",";
                  }

                  var tweetText = '@'+person.twitterUser+' I\'ve found a potential job for you with the following skills: '+ skillsText.substring(0,skillsText.length-1)+'. Please contact: @'+job.twitterUser;
                  console.log(tweetText);

                  var tweet = {in_reply_to_status_id: person.tweetId,
                                status: tweetText }

                  Twitter.post('statuses/update', tweet, tweeted);

                  function tweeted(err, data, response) {
                    if(err){
                      console.log("Something went wrong!"+JSON.stringify(err));
                    }
                    else{
                      console.log("Job contact sent!: "+ JSON.stringify(tweet));
                    }
                  }
                }
              }
            }
            db.close();
        });

      db.close();
    }

  });

}

matchJobs();
