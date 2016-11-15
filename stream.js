var exec = require('child_process').exec;
var child = [];
const fs = require('fs');
var chokidar = require('chokidar');
var Client = require('ftp');
var client = new Client();
var isFtpReady = false;

var rtsp_settings = [
    {uri : '', name : '', ftpdir : ''}
];

var save_in_secs = '20';
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
        var arr = path.split("/");
        var _s = getFiles('videos/', '.mp4');
        var arrP = _s.split('/');
        //console.log("file add : "+arr[arr.length-1]);
        console.log("last file : "+arrP[arrP.length-1]);
        console.log('file video from :'+event, path);
    }else if(event == "change"){
        console.log('file '+event, path);
        var arrCheck = path.split('-');
        arrCheck = arrCheck[arrCheck.length-1].split('.');
        var index = parseInt(arrCheck[0]);
        console.log('file : '+rtsp_settings[index].name);
        var arr = path.split("/");
        var date = new Date();
        var year = date.getFullYear();
        arr[arr.length-1] = date.getDate() + '-' + (date.getMonth() + 1) + '-' + year + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
        var _r = '';
        for(var i = 0; i < arr.length; i++){
            _r = _r+arr[i];
        }
        _r = _r+'.mp4';
        fs.rename(path, _r, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
        if(isFtpReady) {
            client.put(_r, rtsp_settings[index].ftpdir + arr[arr.length-1]+'.mp4', function (err) {
                if (err) {
                    console.log("upload " + arr[arr.length-1]+'.mp4', err);
                } else {
                    console.log("upload " + arr[arr.length-1]+'.mp4', 'success');
                    fs.unlink(_r);
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
    for(var i = 0; i < rtsp_settings.length; i++){
        var cmd = 'ffmpeg -rtsp_transport tcp -i '+rtsp_settings[i].uri+' -vcodec libx264 -segment_time '+save_in_secs+' -reset_timestamps 1 -f segment '+ __dirname + '/videos/' +unique+'-BLATCS_%03d-'+i+'.mp4';
        console.log(' video processing to '+rtsp_settings[i].name+' start');
        child = exec(cmd);
        child.stdout.on('data', function (data) {
            //   console.log('stdout: ' + data);
        });
        child.stderr.on('data', function (data) {
            //     console.log('stdout: ' + data);
        });
        child.on('exit', function (code, signal) {
            console.log('child process terminated due to receipt of signal ' + code);
            console.log(' video created successfully.');
        });
        console.log('Recording Start');
    }
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
        return files_[files_.length - 2];
    }else {
        return files_[files_.length - 1];
    }
}


exports.stop = function () {
    child.kill('SIGTERM');
    client.end();
};

