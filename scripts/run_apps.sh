#!/bin/bash -xe

echo "installing pm2 at startup";
sudo su -c "env PATH=$PATH:/usr/bin pm2 startup ubuntu -u vagrant --hp /home/vagrant";
echo "starting api";
cd /vagrant/dashboard-project-api && pm2 start process.json --env production;
echo "starting app";
cd /var/www/local.userstory.openstack.org && pm2 start process.json --env production;
echo "saving process ...";
pm2 save;
