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

set :mongrel_cmd, "/usr/bin/mongrel_rails"
set :mongrel_port, "80"
set :mongrel_pid, "tmp/pids/mongrel.pid"




namespace :deploy do
  # task :update_code
  # task :symlink
  
  desc "Symlink shared configs and folders on each release."
  task :symlink_shared do
    run "ln -nfs #{shared_path}/db/production.sqlite3 #{release_path}/db/production.sqlite3"
  end
  desc "Start Mongrels processes and add them to launchd."
  task :start, :roles => :app do
  	sudo "#{mongrel_cmd} start --port #{mongrel_port} --pid #{mongrel_pid} \
    	-e production --user #{user} --group #{group} -c #{current_path} -d"
  end

  desc "Stop Mongrels processes and remove them from launchd."
  task :stop, :roles => :app do
  	sudo "#{mongrel_cmd} stop -c #{current_path} -p #{mongrel_pid}"
  end

  desc "Restart Mongrel processes"
  task :restart, :roles => :app do
    run "touch #{current_path}/tmp/restart.txt"
  end
 
end

after 'deploy:symlink', 'deploy:symlink_shared'


