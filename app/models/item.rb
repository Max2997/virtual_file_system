class Item < ApplicationRecord
  include PgSearch
  pg_search_scope :search_by_name,
                  against: :name,
                  using: {
                    tsearch: { prefix: true }
                  }


  extend Enumerize

  KINDS = %w[folder file].freeze
  REGEX_NAME = /\A[a-zA-Z0-9 _-]+\z/

  has_ancestry

  enumerize :kind, in: KINDS, predicates: true, default: :folder, scope: :shallow

  validates :name, format: {
    with: REGEX_NAME,
    message: 'The name of item is invalid (allowed number, letter, space, underscore and upperscopre)'
  }

  validates_uniqueness_of :name, scope: :ancestry
  validates :name, presence: true
  validate :parent_is_require_and_not_file
  validate :prevent_update_data_for_folder, on: :update

  before_validation :strip_name, on: %i[create update]

  before_create do
    self.kind = :file if data.present?
  end

  scope :search_by_name, -> name { where('name ilike ?', "%#{name}%") }

  def size_of
    return descendant_ids.count if folder?

    data&.length || 0
  end

  def path_name
    path.pluck(:name).join('/')
  end

  def self.valid_name?(name)
    name.match? Item::REGEX_NAME
  end

  def self.search(query)
    __elasticsearch__.search(
      {
        query: {
          multi_match: {
            query: query,
            fields: ['name']
          }
        }
      }
    )
  end

  private

  def strip_name
    self.name = name&.strip # remove space at the start and end of the name
  end

  def parent_is_require_and_not_file
    return if parent.present? && parent&.folder?

    errors.add(:parent_id, 'The item must be created under a folder')
  end

  def prevent_update_data_for_folder
    errors.add(:data, 'The folder can not contain content') if data.present? && folder?
  end
end
