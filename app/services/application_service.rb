class ApplicationService
  def self.call(*args)
    new(*args).call
  end

  def call
    raise NotImplementedError, "You must define `call` as instance method in #{self.class.name} class"
  end
end

class ServiceResponse
  attr_accessor :payload, :errors

  def initialize(payload: nil, errors: [])
    @payload = payload
    @errors = errors
  end

  def fail?
    errors.any?
  end

  def success?
    !fail?
  end
end
