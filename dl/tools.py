import datetime
from flask import current_app
import sys
from dotenv import load_dotenv
import os


# connection to the database
#config = dotenv_values(".env") 
load_dotenv

# function managing the creation of the logs depending of the context
def add_log(date_log: datetime, user_connected: str, action_log: str) -> int:
    try:
        # Use the app's database connection
        my_collection = current_app.db["dl_logs_collection"]

        # creation of the log object
        my_log = {
            "user": user_connected,
            "action": action_log,
            "date": date_log
        }
        
        # save the log in the database
        my_collection.insert_one(my_log)
        
        return 0
        
    except Exception as e:
        current_app.logger.error(f"Error adding log: {str(e)}")
        return -1

