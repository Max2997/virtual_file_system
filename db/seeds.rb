# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Item.roots.find_or_create_by(name: 'System').save(validate: false)

root = Item.roots.first

if root&.is_root? && Item.count == 1
  p "----------------"
  p 'Create item randome name for testing'
  p '=' * 20

  class TestSeed
    def self.create_folder(parent)
      parent.children.create(
        name: Faker::Name.name
      )
    end

    def self.create_file(parent)
      parent.children.create(
        name: Faker::Name.name,
        data: Faker::Lorem.sentence
      )
    end
  end

  10.times do
    p = TestSeed.create_folder(root)
    p "--------- #{p.id} --------- #{p.errors.full_messages} ---- #{p.kind} --- #{p.name}"
  end

  10.times do
    p = TestSeed.create_file(root)
    p "--------- #{p.id} --------- #{p.errors.full_messages} ---- #{p.kind} --- #{p.name}"
  end

  root.children.folder.each do |node|
    p "--- item parent #{node.kind}"
    5.times do
      p = TestSeed.create_folder(node)
      file = TestSeed.create_file(node)
      p "--------- #{p.id} --------- #{p.errors.full_messages} ---- #{p.kind} --- #{p.name}"
      p "--------- #{file.id} --------- #{file.errors.full_messages} ---- #{file.kind} --- #{file.name}"
    end
  end

  p '=' * 20
  p 'Create 1000 item folder and file random'
  1000.times do |i|
    p "----- #{i}"
    offset = rand(Item.count)
    p = TestSeed.create_folder(Item.offset(offset).first)
    file = TestSeed.create_file(Item.offset(offset).first)
    p "-------------- #{p.errors.full_messages} ---- #{file.errors.full_messages}" if p.errors.present? || file.errors.present?
  end

  p "----------------"
  p "create folder and file custom name"

  5.times do |i|
    p = root.children.create(name: "Folder #{i}")
    root.children.create(name: "File #{i}", data: "data of file #{i}")
    5.times do |ii|
      p.children.create(name: "Folder #{ii}")
      p.children.create(name: "File #{ii}", data: "data of file #{ii}")
    end
  end
end
