var path = require('path');
var exec = require('child_process').exec;
var child = [];
var sleep = require('sleep');
const fs = require('fs');
var chokidar = require('chokidar');
var Client = require('ftp');
var client = new Client();
var isFtpReady = false;
var connectionProperties = {
    host: "",
    user: "",
    password: ""
};
client.connect(connectionProperties);

client.on('ready', function () {
    console.log('ready');
    isFtpReady = true;
});





chokidar.watch(__dirname + '/videos/', {ignored: /[\/\\]\./}).on('all', function(event, path) {
    if(event == "add"){
        console.log('file '+event, path);
        if(isFtpReady){
            var arr = path.split("/");
            var _s = getFiles('videos/', '.mp4');
            var arrP = _s.split('/');
            //console.log("file add : "+arr[arr.length-1]);
            console.log("last file : "+arrP[arrP.length-1]);
        }
    }else if(event == "change"){
        console.log('file '+event, path);
        var arr = path.split("/");
        if(isFtpReady) {
            client.put(path, '/ATCS/video/unila1/' + arr[arr.length - 1], function (err) {
                if (err) {
                    console.log("upload " + arr[arr.length - 1], err);
                } else {
                    console.log("upload " + arr[arr.length - 1], 'success');
                }
            });
        }
    }
});

exports.start = function(){
    var cmd = 'ffmpeg -rtsp_transport tcp -i <rtsp-url> -vcodec libx264 -segment_time 10 -reset_timestamps 1 -f segment '+ __dirname + '/videos/' +'YDXJ0028_%03d.mp4';
    console.log(' video processing start');
    child = exec(cmd);
    child.stdout.on('data', function (data) {
      //  console.log('stdout: ' + data);
        });
    child.stderr.on('data', function (data) {
      //      console.log('stdout: ' + data);
        });
    child.on('exit', function (code, signal) {
        console.log('child process terminated due to receipt of signal ' + code);
        console.log(' video created successfully.');
    });
    console.log('Recording Start');
};

var getFiles = function (dir, files_){
    files_ = [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    if(files_.length > 1) {
        console.log("list size > 0 : "+files_.length);
        return files_[files_.length - 2];
    }else {
        console.log("list size < 0 : "+files_.length);
        return files_[files_.length - 1];
    }
}


exports.stop = function () {
    child.kill('SIGTERM');
    client.end();
};

