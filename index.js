'use strict';
var express = require('express');
var fs = require('fs');
var path = require('path');
const cors = require("cors");
const app = express();


var whitelist = ['http://nexecube.xyz']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  // Credentials:true
}
app.use(cors(corsOptions));
// app.use(cors());

app.set('port', 9999);

app.get('/read-windows', function(req, res , next) {
  
  
  try{
    console.log(req.headers.referer)
    // check whether the request is comming from the valid source
    if(req.headers.referer !== 'http://nexeclient.xyz/'){
      throw new Error(`request not allowed`)
    }
    
    const targetPath = path.join('./resources/static/assets/uploads/', req.query.destination, req.query.source);
    
    console.log("targated path=",targetPath)
    fs.stat( targetPath,  function (err, inodeStatus) {
      if (err) {
        // file does not exist-
        if (err.code === 'ENOENT' ) {
          console.log('No file or directory at',targetPath)
          return res.status(404).json({success: false , data : `No file or directory at ,${targetPath}` })
        }
        // miscellaneous error (e.g. permissions)
        console.error('Miscellaneous Error Found',err)
        return res.status(404).json({success: false , data : `Miscellaneous ,${err}` })
      }
      var isDirectory = inodeStatus.isDirectory()
      var sizeInBytes = inodeStatus.size
      const file = fs.createReadStream(targetPath)
      // check if file steam contain error
      const onError = file.on("error", err => {
        file.close();
      // create file read stream
        console.log('Error: Stream cannot created! message follow as : ', err.message)
        return {'code':true,'message':err.message};
      });
      // respond with error as stream didnt get created.
      if(onError.code) return res.status(404).json({success: false , data : onError.message })
      // set headers for file
      res.status(200).header({ 
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=" + req.query.source })
      // start pipe the streaming file
      let transfered = file.pipe(res)
      const TransferedOnFinish = transfered.on("finish", () => {
        file.close();
        console.log("file finish download")
        return {'code':true,'message':'User successfully downloaded the software.'};
      });
      const TransferedOnError = transfered.on("error", err => {
        file.close();
        console.log('Error occure while downloading! message follow as : ', err.message)
        return {'code':true,'message': err.message };              
      });
      return;
      
    })
  }catch(err){
    return res.status(403).json({success: false , data : `Miscellaneous ,${err.message}` })
  }
  

});
app.get('/received', function(req, res , next) {
    res.status(200).json("data received");
});


var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});



