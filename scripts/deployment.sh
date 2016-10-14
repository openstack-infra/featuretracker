#!/usr/bin/env bash

echo "reading config ..." >&2
source deployment.cfg;
RELEASE_DIR=~/deployments/$(date '+%d-%m-%Y-%H-%M-%S')
mkdir -p $RELEASE_DIR;
sudo chmod 770 -R $RELEASE_DIR;
sudo chown :www-data -R $RELEASE_DIR;
echo "cloning repo";
git clone -b master $REPO_URL $RELEASE_DIR;

echo "installing api ..." >&2
cd $RELEASE_DIR/dashboard-project-api && npm install;
cd $RELEASE_DIR/dashboard-project-api && npm run build-sdk;

echo "installing app ..." >&2
cd $RELEASE_DIR/dashboard-project-app && npm install;
cd $RELEASE_DIR/dashboard-project-app && bower install --allow-root;
mkdir -p $RELEASE_DIR/dashboard-project-app/client/components/sdk;
cp $RELEASE_DIR/dashboard-project-api/js/lbServices.js $RELEASE_DIR/dashboard-project-app/client/components/sdk/;
cd $RELEASE_DIR/dashboard-project-app && grunt build:production;

echo "setting file permissions";
sudo chown :www-data -R $RELEASE_DIR;
find $RELEASE_DIR -type f -print0 | xargs -0 chmod 644;
echo "cleanning pm2 process ...";
pm2 stop all;
pm2 delete all;
echo "starting api";
cd $RELEASE_DIR/dashboard-project-api && pm2 start process.json --env production;
echo "starting app";
cd $WEB_DIR && pm2 start process.json --env production;
echo "saving process ...";
pm2 save;

echo 'stopping APACHE web server ...';
sudo service apache2 stop;
echo 'cleaning 80/443 opened connections ...';
sudo fuser -k 80/tcp;
sudo fuser -k 443/tcp;
sudo rm -f $WEB_DIR;
sudo ln -s $RELEASE_DIR/dashboard-project-app/dist/ $WEB_DIR;
sudo ln -s $RELEASE_DIR/dashboard-project-app/node_modules $WEB_DIR/node_modules;
echo 'restarting APACHE ...';
sudo service apache2 start;
