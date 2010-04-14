# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

directories = Directory.create([
		{ :path => "/Data/vtrak1/raw/johnson.pipr.visit1", :label => "Piper" },
		{ :path => "/Data/home/kris", :label => "KJK Home" },
])

directories.each do |d|
	d.measurements.create(
		100.times.to_a.map do |i|
			{ :size => 8000000 + 5 * (i**3) + rand*800000, :created_at => DateTime.now - 100.days + i.days }
		end
	)
end
