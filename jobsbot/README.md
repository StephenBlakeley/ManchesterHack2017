# jobsbot
hack bot

#######Purpose#######

The basic premise of this jobs bot aims to bring those twitter users looking for work, training, mentoring etc. together with those twitter users offering training, jobs, mentorship. This is to be done by using a node.js application which continuously searches tweets for # key words such as #ineedajob, #ihaveajob and connects the users to each other based on criteria to be determined. Details of employers and job seekers will be stored in a mongoDB collection for the purposes of matching many users for as long as a vacancy or training or job seeker is available. Once fulfilled this data will be removed.

####Technologies####

Node.js for application back end logic

MongoDB for storing details of job seekers skills, twitterId, availability, employers type of business, job offering details, training opportunities etc.

Planned front end for employers to validate themselves as real companies.

####Use####

Consists of 3 Services 
* ihaveajob listens to the public stream for #ihaveajob and adds tweet to the database as an available job.
* iwantajob listens to the public stream for #iwantajob and adds tweet to the database as a job search.
* matcher checks DB for matches and tweets the details. This only checks once it must be run each time it is required.

####Future plans####

As part of the planned front end to enable validation and verification of genuine employers - employers could for example provide companies house details to verify company registration number, registered address, directors name etc. this is available via companies house api.

Expansion to include training opportunities/those looking for training, mentoring/those looking to be mentored.

Expansion to other social media outlets such as facebook, linkedin etc.
