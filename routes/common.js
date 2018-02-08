var util = require('util');
var fs = require('fs');
//var busboy = require('connect-busboy');


exports.upload = function(req, res, next) {
    console.log('file upload form');

    res.render('upload', {
        title: 'Upload File'
    });
}

//app.post('/fileupload', function(req, res) {
exports.fileupload = function(req, res) {
    var fstream;
    var fsize = 0;
    var limit_reached = 0;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log("Uploading: " + filename + " to: " + req.session.uploadPath);
	console.log("filename length: " + filename.length);
	console.log("file mimetype: " + mimetype);
	console.log("file encoding: " + encoding);

	// check mimetype ? / extension to only allow gpx files?
	file.on('data', function(data) {
	    console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
	    fsize += data.length;
	});

	// check for file size limit (currently 10MiB)
        file.on('limit', function() {
            console.log('file size limit reached!!!');
            //delete incomplete file
            fs.unlink(req.session.uploadPath + filename, function(err) {
		if (err) {
		    console.log("ERROR: unlink failed for file: " +
				req.session.uploadPath + filename);
		}
	    });
	    limit_reached = 1;
        });

        fstream = fs.createWriteStream(req.session.uploadPath + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
	    // check if size zero
	    if (fsize == 0) {
		console.log('file size is zero!!!');
		fs.unlink(req.session.uploadPath + filename, function(err) {
		    if (err) {
			console.log("ERROR: unlink failed for file: " +
				    req.session.uploadPath + filename);
		    }
		});
		res.send('ERROR: file has size of zero!');
            }
	    else if (limit_reached) {
		res.send('ERROR: file too large (limit is 10MB)!');
	    }
	    else {
		res.send(util.format('Upload complete!\nuploaded %s (%d Kb)',
				     filename, fsize / 1024));
	    }
	});
    });
}

