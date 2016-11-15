# ATCS-Video-Recorder
Simpan data atcs video setiap 'n' detik sekali lewat RTSP, kemudian simpan ke NAS secara berkala

# Requirements :
* install `FFMPEG` : https://ffmpeg.org/download.html
* `npm install child_process` : exec ffmpeg cmd
* `npm install fs` : file system.
* `npm install chokidar` : files, dirs watcher.
* `npm install ftp` : ftp connection

# Use :
edit `rtsp_settings` array. You can add one or more camera/rtsp settings :

`uri` : rtsp url.

`name` : name of camera.

`ftpdir` : folder to save video in remote ftp.

`save_in_secs` : n-secs. Video duration.

`connectionProperties` : FTP Setup.


# RUN

`node /bin/www`
