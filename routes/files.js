var path = require('path');
var mime = require('mime');
var fs = require('fs');
const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const photoPathInServer = '/public/customers/';

router.get('/download', function (req, res) {
  try {
    // e.g. http://localhost:5000/api/files/download?filename=palette1.jpeg
    var file = process.cwd() + photoPathInServer + req.query.filename;

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var fileStream = fs.createReadStream(file);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/upload', [auth, admin], function (req, res) {
  // fileName: customerId.jpg,e,g 20210301abcedabced.jpg
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let uploadFile = req.files.myFile;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      uploadFile.mv('.' + photoPathInServer + uploadFile.name);

      res.status(200).send({
        status: true,
        message: 'File is uploaded successfully.',
        data: {
          name: uploadFile.name,
          mimetype: uploadFile.mimetype,
          size: uploadFile.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
