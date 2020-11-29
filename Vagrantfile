# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = '2'

if Vagrant::Util::Platform.windows? then
  def running_in_admin_mode?
    (`reg query HKU\\S-1-5-19 2>&1` =~ /ERROR/).nil?
  end

  unless running_in_admin_mode?
    puts "This vagrant makes use of SymLinks to the host. On Windows, Administrative privileges are required to create symlinks (mklink.exe). Try again from an Administrative command prompt."
    exit 1
  end
end

@script = <<SCRIPT
# update apt
sudo apt-get update

# install Node.js and NPM
sudo apt-get install -y nodejs npm

# npm doesn't play nicely when installed in the Vagrant shared folder on Windows,
# so to get around this, along with the SharedFoldersEnableSymlinksCreate directive
# we install node_modes in /home/vagrant, and then create a symlink to them in the
# /vagrant folder
ln -s /vagrant/package.json /home/vagrant/package.json
npm install --prefix /home/vagrant
ln -s /home/vagrant/node_modules /vagrant/node_modules

SCRIPT

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = 'bento/ubuntu-20.04'
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.provision 'shell', inline: @script

  config.vm.provider "virtualbox" do |vb|
    vb.customize ["modifyvm", :id, "--cableconnected1", "on"]
    vb.customize ["modifyvm", :id, "--memory", "1024"]
    vb.customize ["modifyvm", :id, "--name", "React Tutorial - Ubuntu 20.04"]
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
  end
end
