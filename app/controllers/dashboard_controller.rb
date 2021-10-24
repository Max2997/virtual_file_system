class DashboardController < ApplicationController
  def index
    session[:current_working_id] = @current_working.id
  end
end
