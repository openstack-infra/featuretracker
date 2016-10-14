$vhost_name = 'local.userstory.openstack.org'
$app_port   = 8080
$api_port   = 3004
	
$main_packages = [
  'curl',
  'wget',
  'build-essential',
  'git',
  'nodejs',
  'nodejs-legacy',
  'npm',
]

exec { 'apt-get update':
  command => '/usr/bin/apt-get update',
  timeout => 0
}

package { $main_packages:
  ensure  => present,
  require => [
    Exec['apt-get update']
  ],
}

exec { 'install strongloop':
  command => '/usr/bin/npm install -g strongloop',
  timeout => 0,
  require => [
    Package[$main_packages]
  ],
}

exec { 'install grunt-cli':
  command => '/usr/bin/npm install -g grunt-cli',
  timeout => 0,
  require => [
    Package[$main_packages]
  ],
}

exec { 'install bower':
  command => '/usr/bin/npm install -g bower',
  timeout => 0,
  require => [
    Package[$main_packages]
  ],
}

exec { 'install pm2':
  command => '/usr/bin/npm install -g pm2',
  timeout => 0,
  require => [
    Package[$main_packages]
  ],
}

class {'::mongodb::server':
  port    => 27017,
  verbose => true,
  require => [
    Package[$main_packages]
  ],
}

#install apache2

class { '::apache':
  default_vhost => false,
}

::apache::listen { '80': }

::apache::vhost::custom { $vhost_name:
    priority => '50',
    content  => template('site/vhost.erb'),
    require => [
      Package[$main_packages]
    ],
}

class { '::apache::mod::ssl': }
class { '::apache::mod::rewrite': }
class { '::apache::mod::proxy': }
class { '::apache::mod::proxy_http': }
class { '::apache::mod::headers': }
class { '::apache::mod::expires': }
class { '::apache::mod::include': }
