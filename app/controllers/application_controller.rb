class ApplicationController < ActionController::Base
  before_action :current_working

  private

  def current_working
    @current_working ||= Item.find_by_id(session[:current_working_id]) || Item.roots.first
  end
end
