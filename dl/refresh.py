from dlx import DB
from .config import Config
import time
import re
import datetime
import boto3
from pymongo import MongoClient
from dlx.marc import Bib, BibSet, Query, Condition
from datetime import datetime
from babel.dates import format_datetime


# function that formats translated dates in French and Spanish
def get_date_in_lang(date, locale):
    dateStr=datetime.strptime(date, '%d %B %Y')
    lang_format = format_datetime(dateStr, "long", locale=locale)
    if locale=='es_ES':
        return f"{' '.join(lang_format.split(' ')[0:5]).rstrip(',')}"
    elif locale=='fr_FR':
        return f"{' '.join(lang_format.split(' ')[0:3]).rstrip(',')}"
    else:
        pass

# function that returns translations of the agenda subjects based onthe english text and a query language code from the lookup table
def query_agendas_collection(text_en, query_lang,coll_agendas):
    # Aggregation pipeline to find documents where 'body' is 'SC' and 'agenda' array contains an object where 'lang' is 'EN' and 'txt' is 'abc'
    pipeline = [
        # Match documents where 'body' is 'SC' and there is an element in the 'agenda' array where 'lang' is 'EN' and 'txt' is 'abc'
        {"$match": {"body": "SC", "agenda.lang": "EN", "agenda.txt": text_en}},
        # Project only the 'txt' field from the matching element in the 'agenda' array
        {"$project": {"_id": 0, "txt": {"$arrayElemAt": ["$agenda.txt", {"$indexOfArray": ["$agenda.lang", query_lang]}]} }}
    ]
    
    # Execute the aggregation pipeline
    result = list(coll_agendas.aggregate(pipeline))
    
    # Print or process the result
    if result:
        #print(result[0]['txt'])  # Accessing the 'txt' field from the first element that matches the criteria
        return result[0]['txt']
    else:
        #print("No matching document found.")
        return text_en


def connect_db():
    # connect to mongoDB and collection
    client = boto3.client('ssm')
    uat_connect_string=client.get_parameter(Name='uatISSU-admin-connect-string')['Parameter']['Value']
    MDBclient = MongoClient(uat_connect_string)
    db = MDBclient['DynamicListings']
    coll_dl5 = db['dl_cd_data_collection']
    coll_agendas=db['dl_agendas_collection']
    DB.connect(client.get_parameter(Name='prodISSU-admin-connect-string')['Parameter']['Value'], database="undlFiles")
    #query_agendas_collection("The situation in the Middle East, including the Palestinian question")
    #this is the parameter value that needs to be selected each time the specific table is refreshed
    return coll_dl5, coll_agendas

def process_records(coll_agendas,query_string,year):
    documents=[]
    #query to get metadata values for the S/PV documents
    # for the time we refresh the full table
    #query_string="191__a:/^S\/PV./ AND 269__a:/^"+str(year)+"-04"+"/"
    query = Query.from_string(query_string) # Dataset-search_query
    #i=0
    lst=[]
    document_symbol=""
    action_date=""
    #press_release=""
    agenda_subject=""
    outcome_vote=""
    outcome_text=""
    #datamodel=(document_symbol, action_date, press_release, agenda_subject, outcome_vote)# defining the order of the fields

    #for the future use to generalize the code to work with other tables. Not used now!
    collumns=[
        {1:"document_symbol","label":"Meeting Record", "query":"191_a", "get_data":"get_value", "etl":""},
        {2:"date","label":"Date", "query":"992_a","get_data":"get_value", "etl":"datetime.strptime(action_date, '%Y-%m-%d').strftime('%d %B %Y')"},
        {3:"topic","label":"Topic", "query":"991_c","get_data":"get_values", "etl":""},
        {4:"outcome","label":"Security Council Outcome", "query":"993_a","get_data":"get_value", "etl":""},
        {5:"vote","label":"Vote", "query":"","get_data":"get_value", "etl":""}
    ]


    #going over the records to extract values for symbol - 191, the date - 992, agenda subject - 991c, resolution number 993a
    # and formating the dictionary to match the schema in the dl5 collection for this table

    for bib in BibSet.from_query(query):

        outcome_vote=""
        outcome_text=""
        document_symbol=bib.get_value('191', 'a')
        action_date=bib.get_value('992','a')
        if action_date !='':
            action_date=datetime.strptime(action_date, '%Y-%m-%d').strftime('%d %B %Y') 
        agenda_subject=''.join(bib.get_values('991','c'))
        #trim the period at the end
        agenda_subject=agenda_subject.rstrip('.')
        outcomes=[]
        outcome_text=bib.get_value('993','a')
        outcome_text_link=""
        outcome_obj={"outcome_vote":outcome_vote,
                        "outcome":[{"outcome_vote":outcome_vote},{"lang":"EN", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""},
                                {"lang":"FR", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""},
                                {"lang":"ES", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""}]}
        
        if outcome_text:
            outcome_text_link="https://undocs.org/"+outcome_text
            outcome_obj={"outcome_vote":outcome_vote,
                        "outcome":[{"outcome_vote":outcome_vote},{"lang":"EN", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""},
                                {"lang":"FR", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""},
                                {"lang":"ES", "outcome_text":outcome_text,"outcome_text_link":outcome_text_link,"outcome_text_prefix":"","outcome_text_sufix":""}]}
    # this is to create outcome text structure if we have text or if not we generate 
        else:
            # we need second query to find a vote value. We are searching for bib/voting records where 952 matches our current S/PV. symbol 
            query2 = Query.from_string("952__a:'"+document_symbol+"'") # Dataset-search_query
            # iterate over the metadata in the bib record to assemble outcome_vote and outcome text
            for bib in BibSet.from_query(query2):
                outcome_vote=str(int(bib.get_value('996', 'b')))+"-"+str(int(bib.get_value('996', 'c')))+"-"+str(int(bib.get_value('996', 'd')))
                #if not bib.get
                
                outcome_texts=bib.get_values('791','a')
                for outcome_text in outcome_texts:
                    if outcome_text:
                        outcome_vote=str(int(bib.get_value('996', 'b')))+"-"+str(int(bib.get_value('996', 'c')))+"-"+str(int(bib.get_value('996', 'd')))
                        outcome_obj={"outcome_vote":outcome_vote,
                                "outcome":[{"lang":"EN", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""},
                                        {"lang":"FR", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""},
                                        {"lang":"ES", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""}]}
                    else:
                        outcome_vote=str(int(bib.get_value('996', 'b')))+"-"+str(int(bib.get_value('996', 'c')))+"-"+str(int(bib.get_value('996', 'd')))
                        outcome_obj={"outcome_vote":outcome_vote,
                                "outcome":[{"lang":"EN", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""},
                                        {"lang":"FR", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""},
                                        {"lang":"ES", "outcome_text":outcome_text,"outcome_text_link":"https://undocs.org/"+outcome_text,"outcome_text_prefix":"","outcome_text_sufix":""}]}


                outcomes.append(outcome_obj)
        #i+=1
        #print(i,document_symbol,outcomes)
        if outcomes==[]:
            outcomes.append(outcome_obj)
        outcome_text=""
        outcome_vote=""         
        data_model=(document_symbol, action_date, agenda_subject, outcomes)

        lst.append(data_model)

    #documents is a list comprehension to build list of objects to be created/updated in the dl5 collection in MDB
    #translate_from_en is using a separate module translatePhrase.py to tranlsate agenda subjects to French and Spanish
    documents=[
        {"meeting_record":document_symbol,
        "meeting_record_link":"https://undocs.org/"+document_symbol,
        #"date":action_date,
        "date":[{"lang":"EN","value":action_date},
                {"lang":"FR","value":get_date_in_lang(action_date,'fr_FR')},
                {"lang":"ES","value":get_date_in_lang(action_date,'es_ES')}],
        "topic":[{"lang":"EN","value":agenda_subject},
                {"lang":"FR","value": query_agendas_collection(agenda_subject, "FR",coll_agendas)},
                #{"lang":"FR","value":agenda_subject},
                {"lang":"ES","value":query_agendas_collection(agenda_subject, "ES",coll_agendas)}],
                #{"lang":"ES","value":agenda_subject}],
        "refresh":True,
        "listing_id":"scmeetings_"+str(year),
        "outcomes":outcomes
        }

    for document_symbol, action_date, agenda_subject, outcomes in lst
    ]
    #print(documents)
    return documents

def refresh_scmo(year:str,month:str):
# for each doc in documents list find the matching record in the DB
# if match and if mdb_doc['refresh']==True, update the record in the dl5 with the up to date data; do not update the record if mdb_doc['refresh']==False
    #coll_dl5, _=connect_db()
    query_string ='191__a:"S/PV." AND 992:"'+year+"-"+month+'"'
    coll_dl5,coll_agendas=connect_db()
    documents=process_records(coll_agendas,query_string,year)
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
   
    
