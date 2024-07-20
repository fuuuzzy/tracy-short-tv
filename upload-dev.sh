#!/bin/bash

#远程服务器ip或者别名
REMOTE_SERVER=be-power-cf
#远程服务器目录
TARGET_PATH=/opt/bepower-admin/video

echo "START PACKAGE short-video"

mvn clean package -D maven.test.skip=true

echo "END PACKAGE short-video"

scp -r dist ${REMOTE_SERVER}:${TARGET_PATH}

echo "upload short-video successfully"
