module Directory
  class SelectedItemService
    def initialize(path:, current_working:)
      @path = path
      @current_item = current_working
    end

    def call
      return @current_item if @path.blank?

      execute_path
      execute_list_name

      @current_item
    rescue StandardError => e
      raise e
    end

    private

    def execute_path
      if @path.start_with?('/')
        @current_item = Item.roots.first
        # remove slash
        @path = @path[1..]
      end
      @list_name = @path.split('/')
    end

    def execute_list_name
      @list_name.each do |name|
        case name
        when '..'
          execute_double_dot
          break
        when '.' then next
        else
          execute_another_case(name)
        end
      end
    end

    def execute_double_dot
      return raise 'The PATH is invalid' if @current_item.is_root?

      @current_item = @current_item.parent
    end

    def execute_another_case(name)
      return raise 'The PATH is invalid' unless Item.valid_name?(name)

      item = @current_item.children.find_by_name(name)

      return raise 'The PATH is invalid' if item.blank?

      @current_item = item
    end
  end
end
