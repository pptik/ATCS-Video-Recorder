# ATCS-Video-Recorder
Simpan data atcs video setiap 'n' detik sekali lewat RTSP, kemudian simpan ke NAS secara berkala

# Requirements :
* install `FFMPEG` : https://ffmpeg.org/download.html
* `npm install child_process` : exec ffmpeg cmd
* `npm install fs` : file system.
* `npm install chokidar` : files, dirs watcher.
* `npm install ftp` : ftp connection

# Use :
`rtsp_uri` : rtsp url ke atcs

`save_in_secs` : n-detik. Durasi video yang akan disimpan.

`connectionProperties` : Setup FTP

`ftp_directory` : Folder remote dimana video disimpan
