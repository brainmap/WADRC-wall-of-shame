$:.unshift(File.expand_path('./lib', ENV['rvm_path']))  # Add RVM's lib directory to the load path.
require "rvm/capistrano"                                # Load RVM's capistrano plugin.
require "bundler/capistrano"
require "whenever/capistrano"

#default_run_options[:pty] = true
#ssh_options[:paranoid] = false

set :application, "Wall-of-Shame"
set :host_server, "intranet.brainmap.wisc.edu"
role :app, host_server
role :web, host_server
role :db,  host_server, :primary => true

set :user, "deployer"
set :group, "deployer"
set :deploy_to, "/var/www/rails_apps/wadrc-wall-of-shame"

set :scm, "git"
#set :scm_command, "/usr/local/git/bin/git"
set :git, "/usr/local/bin/git"
set :repository, "git@github.com:brainmap/WADRC-wall-of-shame.git"
set :branch, "master"

set :rvm_ruby_string, '1.9.2'

# set :ruby_cmd, "/Users/rails_deployer/.rvm/bin/ruby-1.9.2-head"
# set :thin_cmd, "/Users/rails_deployer/.rvm/gems/ruby-1.9.2-head/gems/thin-1.2.7/bin/thin"
# set :thin_pid, "tmp/pids/thin.pid"
# set :thin_port, "80"


namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  desc "Symlink shared configs and folders on each release."
  task :symlink_shared do
    run "ln -nfs #{shared_path}/db/production.sqlite3 #{release_path}/db/production.sqlite3"
  end
 
end

after 'deploy:symlink', 'deploy:symlink_shared'


