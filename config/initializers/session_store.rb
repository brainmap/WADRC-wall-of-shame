# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key    => '_wall-of-shame_session',
  :secret => '1cab76b0b41ce7b0a5acc4a320c4223856e595bf7076e9209ce124b36b44732ff6a80ef7669b8d4442bc274fb0f542b03b9135ee784c432aac8f3050b8a8406f'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
