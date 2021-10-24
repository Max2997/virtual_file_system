Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root to: 'dashboard#index'

  resources :items, only: %i[index create] do
    collection do
      get :set_current_working
      get :cat_detail
      get :find
      put :update_item
      put :move
      delete :remove
    end
  end
end
