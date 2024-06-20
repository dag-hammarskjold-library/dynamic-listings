import datetime
from pymongo import MongoClient
import sys
from dotenv import load_dotenv
import os


# connection to the database
#config = dotenv_values(".env") 
load_dotenv

# function managing the creation of the logs depending of the context
def add_log(date_log:datetime,user_connected:str,action_log:str)-> int:
    
    try:
    
        # definition of the parameters for the mongo client
        my_client = MongoClient(
            #config["DATABASE_CONN"]
            os.getenv("DATABASE_CONN")
        )
        
        # setup the database and the collection
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_logs_collection"]

        # creation of the log object
        my_log = {
            "user": user_connected,
            "action": action_log,
            "date": date_log
        }
        
        # save the log in the database
        my_collection.insert_one(my_log)
        
        return 0
        
    except:
        
        e = sys.exc_info()[0]
        return -1
    