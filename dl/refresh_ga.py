from dlx import DB
from .config import Config
import re
import datetime
import boto3
from pymongo import MongoClient
from dlx.marc import BibSet, Query
from datetime import datetime
from babel.dates import format_datetime
import importlib
from collections import defaultdict
import builtins

client = boto3.client('ssm')
uat_connect_string=client.get_parameter(Name='uatISSU-admin-connect-string')['Parameter']['Value']
MDBclient = MongoClient(uat_connect_string)
db = MDBclient['DynamicListings']
coll_dl5_GARES = db['dl_ga_res_data_collection']
coll_titles_GARES=db["dl_ga_titles"]
config_collection_GARES = db['GA_RES_config']

class MyList(list):
    def list_to_string(self, sep):
        if isinstance(self, list):
            return sep.join(str(item) for item in self)


class ExtractText:
    def __init__(self, text, trigger_map=None):
        self.text = text
        # Optional: map of allowed value -> regex pattern that triggers it
        self.trigger_map = trigger_map or {}

    def extract(self, *args, **options):
        allowed_map = {v.strip().lower(): v for v in args[:-1]}
        allowed_set = set(allowed_map.keys())
        fallback=args[-1]
        sep = options.get("sep")
        split_pattern = options.get("split_pattern")

        result = []

         # Trigger-based matches
        for val_lower, val_original in allowed_map.items():
            pattern = self.trigger_map.get(val_lower)
            if pattern and re.search(pattern, self.text, re.IGNORECASE):
                if val_original not in result:
                    result.append(fallback)

        # Split-based matches
        parts = [p.strip() for p in re.split(split_pattern, self.text)]
        result.clear()
        for p in parts:
            p_lower = p.lower()
            if p_lower in allowed_set and allowed_map[p_lower] not in result:
                result.append(allowed_map[p_lower])
        if result==[]:
            result.append(fallback)    

        return sep.join(result)
    
class DateFormatter:
    def __init__(self, text, trigger_map=None):
        self.text = text
        # Optional: map of allowed value -> regex pattern that triggers it
        self.trigger_map = trigger_map or {}
    def convert(self, input_format="%Y-%m-%d", output_format="%d %B %Y"):
        """
        Converts date string from input_format to output_format.

        Parameters:
        - date_str: the date string to convert
        - input_format: format of the input date string (default: 'dd/mm/yyyy')
        - output_format: desired output format (default: 'd Month yyyy')

        Returns:
        - formatted date string or error message if parsing fails
        """
        try:
            date_obj = datetime.strptime(self.text, input_format)
            return date_obj.strftime(output_format)
        except ValueError:
            return "Invalid date or format"
        

class TitleExtractor:
    def __init__(self, items: list[str]):
        """
        Initialize with a list structured as [lang, title, lang, title, ...].
        Converts it into an internal dictionary for fast lookup.
        """
        #print(f"Items: {items}")
        self.mapping = {}
        if len(items) % 2 != 0 or len(items) == 0:
            #raise ValueError("List length must be even: alternating [lang, title].")
            self.mapping = {}
        try:
                # Build dictionary {lang: title}
                for i in range(0, len(items), 2):
                        if items[i] in ['ara', 'chi', 'eng', 'fre', 'rus', 'spa']:
                                self.mapping[items[i]]= items[i + 1] 
                        elif items[i+1] in ['ara', 'chi', 'eng', 'fre', 'rus', 'spa']:
                               self.mapping[items[i+1]]= items[i] 
                        else:
                                self.mapping = {}
        except Exception as e: 
                print(f"Error processing items: {e}")
                self.mapping = {}                

    def get_title(self, lang_code: str, *, default: str = "[]") -> str:
        """
        Return the title for a given 3-letter lang_code,
        or None if not found.
        """
       
        if self.mapping=={}:
                #print(f"default is {default}")
                return default
                
        else:
                #print(f"lang_code is {lang_code}")
                #print(f"mapping is {self.mapping}")
                return self.mapping.get(lang_code, default)  # still str
    
    
def concatenate(items, separator=" "):
    return separator.join(str(x) for x in items)


def normalize_vote_value(value, lang="en"):
    if not isinstance(value, str):
        return value

    cleaned = value.strip("-").strip("-")

    if cleaned.lower() == "without vote":
        if lang == "fr":
            return "sans vote"
        elif lang == "es":
            return "sin votación"
        else:
            return "without a vote"
    return cleaned


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

def get_plenary_in_lang(plenary, query_lang):
        if plenary=="Plenary":
                if query_lang == "es_ES":
                     return "Plenaria"
                elif query_lang == "fr_FR":
                     return "Plénière"
                else:
                     return "Plenary"
        else:
                return plenary


def connect_db_GARES():
    # connect to mongoDB and collection

    DB.connect(Config.connect_string, database="undlFiles")
    #query_agendas_collection("The situation in the Middle East, including the Palestinian question")
    #this is the parameter value that needs to be selected each time the specific table is refreshed 
    return coll_dl5_GARES, coll_titles_GARES, config_collection_GARES

# function that returns translations of the agenda subjects based onthe english text and a query language code from the lookup table
def query_titles_collection(text_lang,text_en, query_lang,coll_titles_GARES):
    # Aggregation pipeline to find documents where 'body' is 'SC' and 'agenda' array contains an object where 'lang' is 'EN' and 'txt' is 'abc'
        #print(f"Querying for title: {text_en} in lang: {query_lang}")
        #print(f"text_lang: {text_lang}")
        if text_lang!='[]':
                return text_lang

        pipeline = [
                # Match documents where 'body' is 'SC' and there is an element in the 'agenda' array where 'lang' is 'EN' and 'txt' is 'abc'
                {"$match": {"body": "GA", "title.lang": "EN", "title.txt": text_en}},
                # Project only the 'txt' field from the matching element in the 'agenda' array
                {"$project": {"_id": 0, "txt": {"$arrayElemAt": ["$title.txt", {"$indexOfArray": ["$title.lang", query_lang]}]} }}
        ]
        
        # Execute the aggregation pipeline
        result = list(coll_titles_GARES.aggregate(pipeline))
        
        # Print or process the result
        if result:
                #print(result[0]['txt'])  # Accessing the 'txt' field from the first element that matches the criteria
                return result[0]['txt']
        else:
                #print("No matching document found.")
                return text_en




def load_ga_resolutions_config(config_collection_GARES=None):
    # Connect to MongoDB
    #client = MongoClient('mongodb://localhost:27017')  # Change if needed
    #db = client['your_database_name']  # Replace with your DB name
    #config_collection = db['garesolutions_config']

    # Fetch the document with _id='ga_resolutions'
    config_doc = config_collection_GARES.find_one({"_id": "ga_resolutions"})

    if not config_doc:
        raise ValueError("No configuration found with _id='ga_resolutions'")

    # Remove the _id field before returning
    config_doc.pop('_id', None)
    #print(config_doc)
    return config_doc



def process_Records_GARES(session:str,year:int,month:int):

        config_doc = load_ga_resolutions_config(config_collection_GARES)
        #Title=""
        row_raw = {}
        row_final={} 
        # year=2025
        # month=6
        # session="78"
        monthstr=str(month).zfill(2)  # Ensure month is two digits
        year,month,session=year,month,session
        
        #query_string='791__a:"A/RES/'+session+'/"'+' AND 791__c:"'+session +'"'
        query_string='791__a:"A/RES/'+session+'/"'+' AND 791__c:"'+session +'" AND 992:"'+str(year)+'-'+monthstr+'"'
        print(query_string)
        query = Query.from_string(query_string) # Dataset-search_query
        resultLst=[]
        for bib in BibSet.from_query(query, sort={"791.subfields.value":-1}):
                #print(bib.id)
                results = {}

                for task_name, task in config_doc.items():
                        module_name = task["module"]
                        heading = task.get("heading", "")
                        class_name = task["class"]
                        method_name = task["method"]
                        init_args = task.get("init_args", [])
                        init_kwargs = task.get("init_kwargs", {})
                        method_args = task.get("args", [])
                        method_kwargs = task.get("kwargs", {})
                        rightetl= task.get("rightetl")
                        rightetl_module=task.get("rightetl_module")
                        rightetl_class=task.get("rightetl_class")
                        rightetl_method=task.get("rightetl_method")
                        rightetl_init_args = task.get("rightetl_init_args", [])
                        rightetl_init_kwargs = task.get("rightetl_init_kwargs", {})
                        rightetl_args = task.get("rightetl_args", [])
                        rightetl_kwargs = task.get("rightetl_kwargs", {})
                        leftetl = task.get("leftetl")
                        leftetl_module=task.get("leftetl_module")
                        leftetl_class=task.get("leftetl_class")
                        leftetl_method=task.get("leftetl_method")
                        leftetl_init_args = task.get("leftetl_init_args", [])
                        leftetl_init_kwargs = task.get("leftetl_init_kwargs", {})
                        leftetl_args = task.get("leftetl_args", [])
                        leftetl_kwargs = task.get("leftetl_kwargs", {})
                        
                        document_symbol=""
                        
                        try:
                                # Import the module
                                module = importlib.import_module(module_name)

                                # Get the class
                                cls_letl = getattr(module, class_name)

                                # Create an instance of the class
                                #instance = cls(*init_args, **init_kwargs)
                                instance = bib
                                # Get the method from the instance
                                method = getattr(instance, method_name)

                                # Call the method with args
                                #works except etl operations


                                if '__' in method_args[0]:
                                        method_args=method_args[0].split('__')
                                        #method_args = argsToList(method_args)
                                elif '_' in method_args[0]:
                                        method_args=method_args[0].split('_')
                                else:
                                        pass
                                
                                result = method(*method_args, **method_kwargs)
                                row_raw[task_name] = result
                                if leftetl !="":
                                        leftetl_init_args.clear()
                                        #leftetl_args.clear()
                                        leftetl_init_args = task.get("leftetl_init_args", [])
                                        #leftetl_args = task.get("leftetl_args", [])
                                        if leftetl_module:
                                                # Import the module
                                                leftetl_module = importlib.import_module(leftetl_module)
                                                if leftetl_class:
                                                        cls_letl = getattr(leftetl_module, leftetl_class)
                                                else:
                                                        cls_letl = getattr(builtins, leftetl_class)
                                                #cls_letl = getattr(builtins, "str")
                                                # Get the class cls = getattr(__builtins__, "str")
                                                #cls_letl = getattr(leftetl_module, leftetl_class)
                                                # Create an instance of the class
                                                instance_cls_letl = cls_letl(*leftetl_init_args, **leftetl_init_kwargs)
                                                # Get the method from the instance
                                                method_letl = getattr(instance_cls_letl, leftetl_method)
                                        else:
                                                if leftetl_class:
                                                        if leftetl_class in globals():
                                                                cls_letl = globals()[leftetl_class]
                                                                leftetl_init_args.append(result)
                                                                instance_cls_letl = cls_letl(*leftetl_init_args, **leftetl_init_kwargs)
                                                                method_letl = getattr(instance_cls_letl, leftetl_method)
                                                                
                                                        else:
                                                                cls_letl = getattr(builtins, leftetl_class)
                                                        #cls_letl = getattr(builtins, "str")
                                                        # Get the class cls = getattr(__builtins__, "str")
                                                        #cls_letl = getattr(leftetl_module, leftetl_class)
                                                        # Create an instance of the class
                                                                instance_cls_letl = cls_letl(*leftetl_init_args, **leftetl_init_kwargs)
                                                                # Get the method from the instance
                                                                method_letl = getattr(instance_cls_letl, leftetl_method)
                                                # Get the method from the instance
                                                #how to configure it so that ' '.join(result) can run
                                                
                                                #result=MyList(result)
                                                #result = MyList(result).list_to_string()
                                                else:
                                                        method_letl = getattr(result, leftetl_method)
                                                # Call the method with args
                                        
                                        try:
                                                result = method_letl(*leftetl_args, **leftetl_kwargs)
                                        except Exception as e:
                                                #print(f"{row_raw}: Error - {e}")
                                                pass

                                #row_raw[task_name] = result
                                if rightetl !="":
                                        # Import the module
                                        rightetl_init_args.clear()
                                        rightetl_init_args = task.get("rightetl_init_args", [])
                                        #rightetl_args.clear()
                                        #rightetl_args = task.get("rightetl_args", [])
                                        if rightetl_module:
                                                rightetl_module = importlib.import_module(rightetl_module)
                                                if rightetl_class:
                                                        cls_retl = getattr(rightetl_module, rightetl_class)
                                                else:
                                                        cls_retl = getattr(builtins, rightetl_class)
                                                #cls_letl = getattr(builtins, "str")
                                                # Get the class cls = getattr(__builtins__, "str")
                                                #cls_letl = getattr(leftetl_module, leftetl_class)
                                                # Create an instance of the class
                                                instance_cls_retl = cls_retl(*rightetl_init_args, **rightetl_init_kwargs)
                                                # Get the method from the instance
                                                method_retl = getattr(instance_cls_retl, rightetl_method)
                                        else:
                                                if rightetl_class:
                                                        if rightetl_class in globals():
                                                                cls_retl = globals()[rightetl_class]
                                                                rightetl_init_args.append(result)
                                                                #rightetl_args.append(result)
                                                                instance_cls_retl = cls_retl(*rightetl_init_args, **rightetl_init_kwargs)
                                                                method_retl = getattr(instance_cls_retl, rightetl_method)
                                                                
                                                        else:
                                                                cls_retl = getattr(builtins, rightetl_class)
                                                        #cls_letl = getattr(builtins, "str")
                                                        # Get the class cls = getattr(__builtins__, "str")
                                                        #cls_letl = getattr(leftetl_module, leftetl_class)
                                                        # Create an instance of the class
                                                                instance_cls_retl = cls_retl(*rightetl_init_args, **rightetl_init_kwargs)
                                                                # Get the method from the instance
                                                                method_retl = getattr(instance_cls_retl, rightetl_method)
                                                        # Get the method from the instance
                                                        #how to configure it so that ' '.join(result) can run
                                                        
                                                        #result=MyList(result)
                                                        #result = MyList(result).list_to_string()
                                                else:
                                                        method_retl = getattr(result, rightetl_method)
                                                # Call the method with args
                                                
                                        try:
                                                if method_retl:
                                                        result = method_retl(*rightetl_args, **rightetl_kwargs)
                                        except Exception as e:
                                                #print(f"{row_raw}: Error - {e}")
                                                pass

                                row_raw[task_name] = result
                        #resultLst.append(results)    
                                #print(result)
                        ## Step 2: Group by prefix and concatenate results
                        # Initialize a defaultdict to group results by prefi
                        except Exception as e:
                                print(f"Error - {e}")
                #grouped_results = defaultdict(list)    
                grouped_results = defaultdict(list)
                #remove last character from the heading names
                for full_task_name, result in row_raw.items():
                        # Define prefix as first N characters or based on underscore split
                        prefix = full_task_name[:-1]  # e.g., "task1" from "task1_extra" 
                        if full_task_name=="Vote: Y N A3" and result=="":
                                result="Without Vote"
                        grouped_results[prefix].append(str(result).strip(" "))
                        


                # Step 3: Concatenate each group into one result string
                row_final = {prefix: '-'.join(values) for prefix, values in grouped_results.items()}
                tpl=()
                for v in row_final.values():
                        tpl += (v,)
                resultLst.append(tpl)        
                        #print(f"{task_name}: {result}")
        return resultLst #good breakpoint to check the results of the query

#resultLst=process_Records()

def prepare_Documents_GARES(resultLst, session):
        #print(f'time elapsed is {time.time()-time1}')
        #documents = []
        #print(resultLst)        
        #print(document_symbol, Plenary, agenda_numbers, meeting, date, vote, draft_resolution, title)
        fr_FR="fr_FR"
        es_ES="es_ES"
        documents=[
                {"Resolution":document_symbol,
                 "Resolution_prefix_en":"",
                "Resolution_prefix_fr":"",
                "Resolution_prefix_es":"",
                "Resolution_en":document_symbol,
                "Resolution_fr":document_symbol,
                "Resolution_es":document_symbol,
                "Resolution_sufix_en":"",
                "Resolution_sufix_fr":"",
                "Resolution_sufix_es":"",
                "Resolution_link_en":"https://docs.un.org/"+document_symbol,
                "Resolution_link_fr":"https://docs.un.org/"+document_symbol,
                "Resolution_link_es":"https://docs.un.org/"+document_symbol,
                #Plenary/Cttee
                "Plenary_prefix_en":"",
                "Plenary_prefix_fr":"",
                "Plenary_prefix_es":"",   
                "Plenary_en":plenary,
                "Plenary_fr":get_plenary_in_lang(plenary,fr_FR),
                "Plenary_es":get_plenary_in_lang(plenary,es_ES),
                "Plenary_sufix_en":"",
                "Plenary_sufix_fr":"",  
                "Plenary_sufix_es":"",
                #Agenda_numbers
                "Agenda_numbers_prefix_en":"",
                "Agenda_numbers_prefix_fr":"",
                "Agenda_numbers_prefix_es":"",
                "Agenda_numbers_en":agenda_numbers,
                "Agenda_numbers_fr":agenda_numbers,
                "Agenda_numbers_es":agenda_numbers,
                "Agenda_numbers_sufix_en":"",
                "Agenda_numbers_sufix_fr":"",
                "Agenda_numbers_sufix_es":"", 
                #Meeting
                "Meeting_prefix_en":"",
                "Meeting_prefix_fr":"",
                "Meeting_prefix_es":"",
                "Meeting_en":meeting,
                "Meeting_fr":meeting,
                "Meeting_es":meeting,
                "Meeting_sufix_en":"",
                "Meeting_sufix_fr":"",
                "Meeting_sufix_es":"",
                "Meeting_link_en":"https://docs.un.org/"+meeting,
                "Meeting_link_fr":"https://docs.un.org/"+meeting,
                "Meeting_link_es":"https://docs.un.org/"+meeting,
                #"date":action_date,
                #"date":[{"lang":"EN","value":date},
                #        {"lang":"FR","value":get_date_in_lang(date,'fr_FR')},
                #        {"lang":"ES","value":get_date_in_lang(date,'es_ES')}],
                "date_en":  date,
                "date_fr": get_date_in_lang(date,'fr_FR'),
                "date_es": get_date_in_lang(date,'es_ES'),      
                #Vote
                "Vote_prefix_en":"",
                "Vote_prefix_fr":"",
                "Vote_prefix_es":"",
                "Vote_en":normalize_vote_value(vote),
                "Vote_fr":normalize_vote_value(vote, "fr"),
                "Vote_es":normalize_vote_value(vote, "es"),
                "Vote_sufix_en":"",
                "Vote_sufix_fr":"",
                "Vote_sufix_es":"",
                "Vote_link_en":"",
                "Vote_link_fr":"",
                "Vote_link_es":"",
                #Draft Resolution
                "Draft_Resolution_prefix_en":"",
                "Draft_Resolution_prefix_fr":"",
                "Draft_Resolution_prefix_es":"",
                "Draft_Resolution_en":draft_resolution,
                "Draft_Resolution_fr":draft_resolution,
                "Draft_Resolution_es":draft_resolution,
                "Draft_Resolution_sufix_en":"",
                "Draft_Resolution_sufix_fr":"",
                "Draft_Resolution_sufix_es":"",
                "Draft_Resolution_link_en":"https://docs.un.org/"+draft_resolution,
                "Draft_Resolution_link_fr":"https://docs.un.org/"+draft_resolution,
                "Draft_Resolution_link_es":"https://docs.un.org/"+draft_resolution,
                #Title
                "Title_prefix_en":"",
                "Title_prefix_fr":"",
                "Title_prefix_es":"",
                "Title_en":title,
                "Title_fr":query_titles_collection(titleF,title, "FR", coll_titles_GARES),
                "Title_es":query_titles_collection(titleS,title, "ES", coll_titles_GARES),
                "Title_sufix_en":"",
                "Title_sufix_fr":"",
                "Title_sufix_es":"",            
                "refresh":True,
                "listing_id":"garesolutions_"+str(session)
                #"outcomes":outcomes
                }

        for document_symbol, plenary, agenda_numbers, meeting, date, vote, draft_resolution, title, titleF, titleS in resultLst
        ]
        #print(f'time elapsed is {time.time()-time1}')
        return documents

def refresh_GARES(session,year,month):
# for each doc in documents list find the matching record in the DB
# if match and if mdb_doc['refresh']==True, update the record in the dl5 with the up to date data; do not update the record if mdb_doc['refresh']==False
    #coll_dl5, _=connect_db()
    resultLst=process_Records_GARES(session,year,month)
    documents=prepare_Documents_GARES(resultLst, session)    
    #coll_dl5, _=connect_db()
    #documents=process_records()
    for doc in documents:
        update_filter = {'Resolution': doc['Resolution']}
        new_values = {'$set': doc}
        mdb_doc = coll_dl5_GARES.find_one({"Resolution": doc['Resolution']})
        try:
            if mdb_doc['refresh']==True:
                coll_dl5_GARES.update_one(update_filter, new_values, upsert=True)
        except:
            #in case there is not a match an exception will insert a new record
            coll_dl5_GARES.update_one(update_filter, new_values, upsert=True)


def execute_refresh_ga(session,year,month):
    session,year,month=session,year,month
    connect_db_GARES()
    refresh_GARES(session,year,month)
    
    

# execute_refresh_ga("78",2025,6)