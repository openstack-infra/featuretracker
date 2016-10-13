#!/bin/bash -xe

mkdir -p /etc/puppet/modules;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-apt;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-stdlib;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-apache;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-concat;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-apache;
puppet module install --force --module_repository https://forge.puppet.com puppetlabs-mongodb;
