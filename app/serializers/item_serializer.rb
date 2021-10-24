class ItemSerializer < ActiveModel::Serializer
  attributes :name, :kind, :created_at, :size, :path_name

  def size
    object.size_of if @instance_options[:show_size]
  end

  def created_at
    object.created_at.strftime('%x %X')
  end

  def path_name
    object.path_name if @instance_options[:show_path]
  end
end
