var exec = require('child_process').exec;
var child = [];
const fs = require('fs');
var chokidar = require('chokidar');
var Client = require('ftp');
var client = new Client();
var isFtpReady = false;

var rtsp_uri = ''
var save_in_secs = '15';
var connectionProperties = {
    host: "",
    user: "",
    password: ""
};
var ftp_directory = '/ATCS/video/unila1/'
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
            client.put(path, ftp_directory + arr[arr.length - 1], function (err) {
                if (err) {
                    console.log("upload " + arr[arr.length - 1], err);
                } else {
                    console.log("upload " + arr[arr.length - 1], 'success');
                    fs.unlink(path);
                }
            });
        }
    }
});

exports.start = function(){
    var date = new Date();
    var year = date.getFullYear();
    year = year.toString().substr(2, 2);
    var unique = date.getDate() + '-' + (date.getMonth() + 1) + '-' + year + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
    var cmd = 'ffmpeg -rtsp_transport tcp -i '+rtsp_uri+' -vcodec libx264 -segment_time '+save_in_secs+' -reset_timestamps 1 -f segment '+ __dirname + '/videos/' +unique+'-BLATCS_%03d.mp4';
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

