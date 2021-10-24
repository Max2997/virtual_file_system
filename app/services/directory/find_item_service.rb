module Directory
  class FindItemService
    def initialize(current_working:, path:, name:)
      @path = path
      @name = name
      @current_working = current_working
    end

    def call
      return raise 'The name of item is missing' if @name.blank?

      selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call
      return raise 'This file can not contain any item. Please enter your path folder.' if selected_item.file?

      selected_item.descendants.search_by_name(@name)
    rescue StandardError => e
      raise e
    end
  end
end
