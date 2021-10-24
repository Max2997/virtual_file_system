module Directory
  class RemoveItemService
    def initialize(current_working:, paths:)
      @paths = paths
      @current_working = current_working
    end

    def call
      @paths.map do |path|
        path_name = path.strip
        { "#{path_name}": remove_item(path_name) }
      end

    rescue StandardError => e
      raise e
    end

    private

    def remove_item(path)
      selected_item = Directory::SelectedItemService.new(path: path, current_working: @current_working).call

      return false if selected_item.is_root?

      selected_item.destroy

      true
    rescue StandardError
      false
    end
  end
end
