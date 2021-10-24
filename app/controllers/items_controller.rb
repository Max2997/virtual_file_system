class ItemsController < ApplicationController
  before_action :set_path

  def index
    selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call

    return render_error('The PATH is invalid') if selected_item.file?

    render json: selected_item.children, show_size: true, meta: { size: selected_item.size_of }, adapter: :json
  rescue StandardError => e
    render_error(e)
  end

  def set_current_working
    return render_error('The PATH is invalid') if @path.blank?

    begin
      selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call
      return render_error('The PATH is invalid') if selected_item.file?

      update_current_working(selected_item)
      render json: { name: selected_item.name }
    rescue StandardError => e
      render_error(e)
    end
  end

  def create
    Item.transaction do
      item_created = Directory::CreateItemService.new(
        current_working: @current_working, flag: params[:flag] == 'true', data: params[:data], path: @path
      ).call
      render json: { name: item_created.name }
    end
  rescue StandardError => e
    render_error(e)
  rescue ActiveRecord::StaleObjectError
    render_error('Your version of this folder was old. This action was dennied')
  end

  def cat_detail
    return render_error('The PATH is invalid') if @path.blank?

    begin
      selected_item = Directory::SelectedItemService.new(path: @path, current_working: @current_working).call

      return render_error('The PATH is invalid') if selected_item.folder?

      render json: selected_item, show_size: true, meta: { data: selected_item.data }, adapter: :json
    rescue StandardError => e
      render_error(e)
    end
  end

  def find
    result = Directory::FindItemService.new(
      path: @path, current_working: @current_working, name: params[:name]
    ).call
    render json: result, show_path: true
  rescue StandardError => e
    render_error(e)
  end

  def update_item
    selected_item = Directory::UpdateItemService.new(
      name: params[:name], data: params[:data], path: @path, current_working: @current_working
    ).call

    render json: selected_item
  rescue StandardError => e
    render_error(e)
  rescue ActiveRecord::StaleObjectError
    render_error('Your version of this folder was old. This action was dennied')
  end

  def move
    return render_error('The PATH is invalid') if params[:path_destination].blank? || params[:path].blank?

    @path_destination = params[:path_destination].strip
    execute_move_item
  rescue ActiveRecord::StaleObjectError
    render_error('Your version of this folder was old. This action was dennied')
  end

  def remove
    return render_error('The PATH is invalid') if params[:paths].blank?

    result = Directory::RemoveItemService.new(
      current_working: @current_working,
      paths: params[:paths]
    ).call

    render json: { data: result, current_working: fetch_current_working.name }
  end

  private

  def render_error(message)
    render json: { error: message }, status: 400
  end

  def update_current_working(folder)
    @current_working = folder
    session[:current_working_id] = folder.id
  end

  def set_path
    @path = params[:path]&.strip
  end

  def fetch_current_working
    Item.find_by_id(@current_working.id) || Item.roots.first
  end

  def check_item_update_valid
    return render_error('The PATH is invalid') if @path.blank?

    return render_error('The name is not blank') if params[:name].blank?

    return render_error('The name is invalid') unless Item.valid_name?(params[:name])
  end

  def execute_move_item
    selected_item = Directory::MoveItemService.new(
      path_destination: @path_destination,
      path: @path,
      current_working: @current_working
    ).call

    render json: selected_item, show_path: true
  rescue StandardError => e
    render_error(e)
  end
end
