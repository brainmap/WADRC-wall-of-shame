namespace :measure do
	desc "measure filesystem usage for shaming purposes"
	
	task :directories => :environment do
		desc "take a meausrement of every directory in the system"
		Directory.all.each do |directory|
			size = (`du -s -k #{directory.path}`).split.first
			directory.measurements.create :size => size
		end
	end
	 
end