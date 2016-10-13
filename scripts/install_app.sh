#!/bin/bash -xe

cd /vagrant/dashboard-project-app && npm install;
cd /vagrant/dashboard-project-app && bower install --allow-root;
mkdir -p /vagrant/dashboard-project-app/client/components/sdk;
cp /vagrant/dashboard-project-api/js/lbServices.js /vagrant/dashboard-project-app/client/components/sdk/
cd /vagrant/dashboard-project-app && grunt build;
mkdir -p /var/www/local.userstory.openstack.org
sudo cp -a /vagrant/dashboard-project-app/dist/. /var/www/local.userstory.openstack.org/;
sudo cp -a /vagrant/dashboard-project-app/client/app/projectDetail/. /var/www/local.userstory.openstack.org/client/app/projectDetail;
sudo cp -a /vagrant/dashboard-project-app/node_modules/. /var/www/local.userstory.openstack.org/node_modules;
sudo cp -a /vagrant/dashboard-project-app/client/app/projectList/. /var/www/local.userstory.openstack.org/client/app/projectList;
sudo cp /vagrant/dashboard-project-app/process.json /var/www/local.userstory.openstack.org/process.json;
sudo chown www-data:www-data -R /var/www/local.userstory.openstack.org;



