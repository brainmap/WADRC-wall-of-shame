class CreateDirectories < ActiveRecord::Migration
  def self.up
    create_table :directories do |t|
      t.string :path
      t.string :label

      t.timestamps
    end
  end

  def self.down
    drop_table :directories
  end
end
