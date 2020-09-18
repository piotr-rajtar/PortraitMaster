const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const textEscaper = require('../utils').textEscaper;
const fileExtentionChecker = require('../utils').fileExtentionChecker;
const lengthChecker = require('../utils').lengthChecker;
const addVoter = require('../utils').addVoter;
const voteValidator = require('../utils').voteValidator;

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    
    const isExtentionValid = fileExtentionChecker(fileName);
    const authorLength = lengthChecker(author);
    const titleLength = lengthChecker(title);

    if(
      title 
      && author 
      && email 
      && file 
      && isExtentionValid
      && authorLength <= 50
      && titleLength <= 25
    ) {

      const cleanAuthor = textEscaper(author);
      const cleanTitle = textEscaper(title);
      const cleanEmail = textEscaper(email);

      const newPhoto = new Photo({ title: cleanTitle, author: cleanAuthor, email: cleanEmail, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
      
    } else {
      throw new Error('Wrong input!');
    }
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const ip = req.ip;
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const voter = await Voter.findOne({ user: ip });

    async function thumbsUp() {
      photoToUpdate.votes++;
      await photoToUpdate.save();
      res.send({ message: 'OK' });
    }

    async function addUserVote() {
      voter.votes.push(req.params.id);
      await voter.save();
      thumbsUp();
    }

    if(photoToUpdate) {
  
      if(!voter) {

        addVoter(ip, req.params.id);
        thumbsUp();

      } else {
        const ifVoted = voteValidator(voter, req.params.id);

        ifVoted
        ? res.status(500).json({ message: 'Already voted' })
        : addUserVote();
         
      }
    }
    else res.status(404).json({ message: 'Not found' });

  } catch(err) {
    res.status(500).json(err);
  }
};
