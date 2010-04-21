# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever

# every 2.hours do
# 	rake "measure:directories"
# end

# PATH=/Data/home/kris/.rvm/rubies/ruby-1.9.2-head/bin:/Data/home/kris/.rvm/gems/ruby-1.9.2-head/bin:/Data/home/kris/.rvm/gems/ruby-1.9.2-head%global/bin:/Data/home/kris/.rvm/bin:.:/Applications/freesurfer/bin:/Applications/freesurfer/fsfast/bin:/Applications/freesurfer/mni/bin:/usr/local/bin:/usr/local/sbin:/usr/local:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/texbin:/usr/X11/bin:/usr/local/git/bin:/Applications/ImageMagick-6.5.3/bin:/Applications/AFNI/afni_current:/usr/local/fsl_current/bin:/Data/vtrak1/SysAdmin/production/python:/usr/local/texlive/2008basic/bin/universal-darwin:/Data/vtrak1/SysAdmin/production/python:/Data/data1/lab_scripts:/Data/home/kris/bin:/usr/local/mysql/bin
# 
# 0 0 * * * source ~/.profile && cd /path/to/wall-of-shame && RAILS_ENV=production /usr/bin/env rake measure:directories
