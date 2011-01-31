#default_run_options[:pty] = true
#ssh_options[:paranoid] = false

set :application, "Wall-of-Shame"
set :host_server, "kearney.medicine.wisc.edu"
role :app, host_server
role :web, host_server
role :db,  host_server, :primary => true

set :user, "rails_deployer"
set :group, "staff"
set :deploy_to, "/Library/WebServer/wall-of-shame"

set :scm, "git"
#set :scm_command, "/usr/local/git/bin/git"
set :git, "/usr/local/git/bin/git"
set :repository, "git@github.com:brainmap/WADRC-wall-of-shame.git"
set :branch, "master"

set :ruby_cmd, "/Users/rails_deployer/.rvm/bin/ruby-1.9.2-head"
set :thin_cmd, "/Users/rails_deployer/.rvm/gems/ruby-1.9.2-head/gems/thin-1.2.7/bin/thin"
set :thin_pid, "tmp/pids/thin.pid"
set :thin_port, "80"


namespace :deploy do
  # task :update_code
  # task :symlink
  
  desc "Update the current symlink."
  task :symlink do
    sudo "rm -f #{current_path} && ln -s #{release_path} #{current_path}"
  end
  
  desc "Symlink shared configs and folders on each release."
  task :symlink_shared do
    sudo "ln -nfs #{shared_path}/db/production.sqlite3 #{release_path}/db/production.sqlite3"
  end
  desc "Start the Thin server."
  task :start, :roles => :app do
  	sudo "#{ruby_cmd} #{thin_cmd} start --port #{thin_port} -e production -c #{current_path} -d"
  end

  desc "Stop the Thin server."
  task :stop, :roles => :app do
  	sudo "#{ruby_cmd} #{thin_cmd} stop -c #{current_path} -p #{thin_pid}"
  end

  desc "Restart Thin processes"
  task :restart, :roles => :app do
    run "touch #{current_path}/tmp/restart.txt"
  end
 
end

after 'deploy:symlink', 'deploy:symlink_shared'


