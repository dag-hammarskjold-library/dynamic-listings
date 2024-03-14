# imports modules

from flask import Flask
from decouple import config
from .routes import main
from flask_session import Session

# creation of the app factory function

def create_app(test_config=None):
    app=Flask(__name__) 

    #management of the session
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_TYPE"] = "filesystem"  
    sess = Session()
    sess.init_app(app)    
    
    app.register_blueprint(main)
    app.secret_key = config("SECRET_KEY")
    

    
    
    return app