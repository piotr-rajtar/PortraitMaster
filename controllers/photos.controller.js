const Photo = require('../models/photo.model');
const escape = require('../utils').escape;

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExtention = fileName.substr(-3);
    const allowedExtentions = ['jpg', 'jpeg', 'gif', 'png'];

    if(
      title 
      && author 
      && email 
      && file 
      && allowedExtentions.includes(fileExtention)
      && author.length <= 50
      && title.length <= 25
    ) {

      const cleanAuthor = escape(author);
      const cleanTitle = escape(title);
      const cleanEmail = escape(email);

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
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
