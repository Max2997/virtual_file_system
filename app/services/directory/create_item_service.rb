module Directory
  class CreateItemService
    def initialize(path:, data:, flag:, current_working:)
      @path = path
      @data = data
      @flag = flag
      @current_working = current_working
    end

    def call
      execute_path
      new_name_item = @list_name.pop

      return raise 'The name of item is invalid' unless Item.valid_name?(new_name_item)

      execute_list_name

      return raise 'The PATH is invalid' if @current_item.file?

      new_item = @current_item.children.new(name: new_name_item, data: @data)

      return raise 'This item was existed.' unless new_item.save

      new_item
    rescue StandardError => e
      raise e
    end

    private

    def execute_path
      @current_item = @current_working
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

    def create_item_follow_flag(name)
      return @current_item.children.find_or_create_by(name: name) if @flag

      @current_item.children.find_by_name(name)
    end

    def execute_another_case(name)
      return raise 'The PATH is invalid' unless Item.valid_name?(name)

      item = create_item_follow_flag(name)
      return raise 'The PATH is invalid' if item.blank?

      @current_item = item
    end
  end
end
