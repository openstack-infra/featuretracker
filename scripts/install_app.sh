#!/bin/bash -xe

cd /vagrant/dashboard-project-app && npm install;
cd /vagrant/dashboard-project-app && bower install --allow-root;
mkdir -p /vagrant/dashboard-project-app/client/components/sdk;
cp /vagrant/dashboard-project-api/js/lbServices.js /vagrant/dashboard-project-app/client/components/sdk/
cd /vagrant/dashboard-project-app && grunt build:local;
mkdir -p /var/www/local.userstory.openstack.org
sudo cp -a /vagrant/dashboard-project-app/dist/. /var/www/local.userstory.openstack.org/;
sudo ln -s /vagrant/dashboard-project-app/node_modules /var/www/local.userstory.openstack.org/node_modules;
sudo chown www-data:www-data -R /var/www/local.userstory.openstack.org;



