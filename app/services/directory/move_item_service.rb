module Directory
  class MoveItemService
    def initialize(path:, current_working:, path_destination:)
      @path = path
      @path_destination = path_destination
      @current_working = current_working
    end

    def call
      @selected_item_destination = Directory::SelectedItemService.new(
        path: @path_destination, current_working: @current_working
      ).call

      check_valid_items

      move_item
    rescue StandardError => e
      raise e
    end

    private

    def check_valid_items
      return raise 'The destination folder is not found' unless @selected_item_destination.folder?

      @selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call
      return unless @selected_item_destination.descendant_of?(@selected_item)

      raise 'Cannot move a folder to become a subfolder of itself'
    end

    def move_item
      @selected_item.parent = @selected_item_destination

      return @selected_item if @selected_item.save

      raise @selected_item.errors.full_messages.join(', ')
    end
  end
end
