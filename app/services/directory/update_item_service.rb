module Directory
  class UpdateItemService
    def initialize(current_working:, path:, data:, name:)
      @path = path
      @current_working = current_working
      @name = name
      @data = data
    end

    def call
      check_item_update_valid

      selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call
      return raise 'The data can not update for folder' if selected_item.folder? && @data.present?

      selected_item.name = @name
      selected_item.data = @data unless @data.nil?
      return selected_item if selected_item.save

      raise selected_item.errors.full_messages.join(', ')
    rescue StandardError => e
      raise e
    end

    private

    def check_item_update_valid
      return raise 'The PATH is invalid' if @path.blank?

      return raise 'The name is not blank' if @name.blank?

      return raise 'The name is invalid' unless Item.valid_name?(@name)
    end
  end
end
