class CreateMeasurements < ActiveRecord::Migration
  def self.up
    create_table :measurements do |t|
      t.integer :size
      t.references :directory

      t.timestamps
    end
  end

  def self.down
    drop_table :measurements
  end
end
