# imports modules

from flask import Flask
from dotenv import dotenv_values, load_dotenv
from .routes import main
from flask_session import Session
import os

load_dotenv

# creation of the app factory function

def create_app(test_config=None):
    app=Flask(__name__) 

    app.register_blueprint(main)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    return app