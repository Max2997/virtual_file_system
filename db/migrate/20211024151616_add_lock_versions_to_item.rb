class AddLockVersionsToItem < ActiveRecord::Migration[6.1]
  def change
    add_column :items, :lock_version, :integer, default: 0, null: false
  end
end
