class CreateItems < ActiveRecord::Migration[6.1]
  def change
    create_table :items do |t|
      t.string :name
      t.text :data
      t.string :kind

      t.timestamps
    end

    item = Item.new name: 'System'
    item.save(validate: false)
  end
end
