class AddPositionToDirectories < ActiveRecord::Migration
  def self.up
    add_column :directories, :position, :integer
  end

  def self.down
    remove_column :directories, :position
  end
end
