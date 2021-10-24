class AddIndexToItem < ActiveRecord::Migration[6.1]
  def change
    add_index :items, :name
  end
end
