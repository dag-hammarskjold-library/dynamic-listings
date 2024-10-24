from dlx import DB
from config_dlx import Config
import time
import datetime
import boto3
from pymongo import MongoClient
from dlx.marc import Bib, BibSet, Query, Condition
from datetime import datetime
from babel.dates import format_datetime
# from translatePhrase import translate_from_en 

lst=[]
document_symbol=""
action_date=""
press_release=""
agenda_subject=""
outcome_vote=""
outcome_text=""
coll_dl5=""

#this is the function that formats translated dates in French and Spanish
def get_date_in_lang(date, locale):
    dateStr=datetime.strptime(date, '%d %B %Y')
    lang_format = format_datetime(dateStr, "long", locale=locale)
    if locale=='es_ES':
        return f"{' '.join(lang_format.split(' ')[0:5]).rstrip(',')}"
    elif locale=='fr_FR':
        return f"{' '.join(lang_format.split(' ')[0:3]).rstrip(',')}"
    else:
        pass

# connect to mongoDB and collection
def connect_db()-> None:
    client = boto3.client('ssm')
    uat_connect_string=client.get_parameter(Name='uatISSU-admin-connect-string')['Parameter']['Value']
    MDBclient = MongoClient(uat_connect_string)
    db = MDBclient['DynamicListings']
    global coll_dl5
    coll_dl5 = db['dl_cd_data_collection']
    DB.connect(Config.connect_string, database="undlFiles")

def build_query(year : int)-> str:
    #query to get metadata values for the S/PV documents
    # for the time we refresh the full table
    query_string="191__a:/^S\/PV./ AND 269__a:/^"+str(year)+"/"
    return Query.from_string(query_string) # Dataset-search_query


def execute_query(year:int)-> None:
    #going over the records to extract values for symbol - 191, the date - 992, agenda subject - 991c, resolution number 993a
    # and formating the dictionary to match the schema in the dl54 collection for this table
    for bib in BibSet.from_query(build_query(year)):
        outcome_vote=""
        outcome_text=""
        document_symbol=bib.get_value('191', 'a')
        action_date=bib.get_value('992','a')
        if action_date !='':
            action_date=datetime.strptime(action_date, '%Y-%m-%d').strftime('%d %B %Y') 
        agenda_subject=''.join(bib.get_values('991','c'))
        outcomes=[]
        outcome_text=bib.get_value('993','a')
        outcome_obj={"outcome_vote":outcome_vote,
                        "outcome":[{"lang":"EN", "outcome_text":outcome_text},
                                {"lang":"FR", "outcome_text":outcome_text},
                                {"lang":"ES", "outcome_text":outcome_text}]}
    # this is to create outcome text structure if we have text or if not we generate 
        if outcome_text:
            outcomes.append(outcome_obj)
        else:
            # we need second query to find a vote value. We are searching for bib/voting records where 952 matches our current S/PV. symbol 
            query2 = Query.from_string("952__a:/^"+document_symbol+"/") # Dataset-search_query
            # iterate over the metadata in the bib record to assemble outcome_vote and outcome text
            for bib in BibSet.from_query(query2):
                outcome_vote=str(int(bib.get_value('996', 'b')))+"-"+str(int(bib.get_value('996', 'c')))+"-"+str(int(bib.get_value('996', 'd')))
                outcome_text=bib.get_value('791','a')
                outcome_obj={"outcome_vote":outcome_vote,
                        "outcome":[{"lang":"EN", "outcome_text":outcome_text},
                                {"lang":"FR", "outcome_text":outcome_text},
                                {"lang":"ES", "outcome_text":outcome_text}]}
            outcomes.append(outcome_obj)
        outcome_text=""
        outcome_vote=""         
        data_model=(document_symbol, action_date, press_release, agenda_subject, outcomes)

        lst.append(data_model)

def save_data(year:int)-> None:
    #documents is a list comprehension to build list of objects to be created/updated in the dl5 collection in MDB
    #translate_from_en is using a separate module translatePhrase.py to tranlsate agenda subjects to French and Spanish
    documents=[
        {"meeting_record":document_symbol,
        "meeting_record_link":"https://undocs.org/"+document_symbol,
        #"date":action_date,
        "date":[{"lang":"EN","value":action_date},
                {"lang":"FR","value":get_date_in_lang(action_date,'fr_FR')},
                {"lang":"ES","value":get_date_in_lang(action_date,'es_ES')}],
        "press_release":press_release,
        "topic":[{"lang":"EN","value":agenda_subject},
                #{"lang":"FR","value":translate_from_en(agenda_subject,"Helsinki-NLP/opus-mt-en-","fr")},
                {"lang":"FR","value":agenda_subject},
                #{"lang":"ES","value":translate_from_en(agenda_subject,"Helsinki-NLP/opus-mt-en-","es")}],
                {"lang":"ES","value":agenda_subject}],
        "refresh":True,
        "listing_id":"scmeetings_"+str(year),
        "outcomes":outcomes
        }

    for document_symbol, action_date, press_release, agenda_subject, outcomes in lst
    ]


    # for each doc in documents list find the matching record in the DB
    # if match and if mdb_doc['refresh']==True, update the record in the dl5 with the up to date data; do not update the record if mdb_doc['refresh']==False
    for doc in documents:
        update_filter = {'meeting_record': doc['meeting_record']}
        new_values = {'$set': doc}
        mdb_doc = coll_dl5.find_one({"meeting_record": doc['meeting_record']})
        try:
            if mdb_doc['refresh']==True:
                coll_dl5.update_one(update_filter, new_values, upsert=True)
        except:
            #in case there is not a match an exception will insert a new record
            coll_dl5.update_one(update_filter, new_values, upsert=True)
            
            
def proess(year:int)-> None:
    print("Process started")
    try: 
        start_time_chunk=time.time()
        connect_db()
        print(coll_dl5)
        execute_query(year)
        build_query(year)
        save_data(year)
    except:
        pass
    finally:
        end_time_chunk=time.time()
    print(f"Duration : {end_time_chunk-start_time_chunk}")
    print("Process ended")
    
    
    

