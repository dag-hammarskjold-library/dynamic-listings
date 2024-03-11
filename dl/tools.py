from pymongo import MongoClient
import sys
from dlx import DB
from .config1 import Config
# import time
# import re
import datetime
from dlx.marc import Bib, BibSet, Query, Condition
from dotenv import dotenv_values

# function managing the creation of the logs depending of the context
def add_log(date_log:str,user_connected:str,action_log:str)-> int:
    
    try:
    
        # definition of the parameters for the mongo client
        my_config = dotenv_values(".env") 
        my_client = MongoClient(
            my_config["DATABASE_CONN"]
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
    
    
# Definition of the function doing the query against the database using DLX
def query_security_counsel_dataset(my_year:str)->list:
    
    try:
        DB.connect(Config.connect_string, database="undlFiles")
        query = Query.from_string("191__a:/^S\/PV./ AND 269__a:/^"+ my_year +"/") # Dataset-search_query
        lst=[]
        document_symbol,action_date,press_release,agenda_subject,outcome_vote="","","","",""

        for bib in BibSet.from_query(query):
            data_model={}
            document_symbol=bib.get_value('191', 'a')
            action_date=bib.get_value('992','a')
            if action_date !='':
                action_date=datetime.datetime.strptime(action_date, '%Y-%m-%d').strftime('%d %B') 
            agenda_subject=''.join(bib.get_values('991','c'))
            data_model["document_symbol"]=document_symbol
            data_model["action_date"]=action_date
            data_model["press_release"]=press_release
            data_model["agenda_subject"]=agenda_subject
            data_model["outcome_vote"]=outcome_vote
            lst.append(data_model)

        return lst
    
    except:
        return []