# imports modules

from flask import Flask
from dotenv import dotenv_values
from .routes import main
from flask_session import Session

# connection to the database
config1 = dotenv_values(".env") 

# creation of the app factory function

def create_app(test_config=None):
    app=Flask(__name__) 

    app.register_blueprint(main)
    app.config["SECRET_KEY"] = config1["SECRET_KEY"]
    
    return app