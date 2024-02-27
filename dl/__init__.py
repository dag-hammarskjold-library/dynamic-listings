# imports modules

from flask import Flask
from decouple import config
from .routes import main

# creation of the app factory function

def create_app(test_config=None):
    app=Flask(__name__)   
    app.register_blueprint(main)
    app.secret_key = config("SECRET_KEY")
    return app