import re
from werkzeug.security import check_password_hash, generate_password_hash
import json
from flask import Blueprint, jsonify, redirect, render_template,request, send_file, session,redirect
from pymongo.mongo_client import MongoClient
import datetime
from datetime import date
from .tools import add_log
from .refresh import refresh_scmo
from .refresh_ga import execute_refresh_ga
from bson.objectid import ObjectId
import requests
from dotenv import load_dotenv
from bson import json_util
import os


# definition of the Blueprint
main=Blueprint("main",__name__)

# connection to the database
#config = dotenv_values(".env") 
load_dotenv()
my_client = MongoClient(os.getenv("DATABASE_CONN"))


####################################################################################################################
####################################################################################################################
############  LOGIN ROUTES
####################################################################################################################
####################################################################################################################

@main.route("/", methods=["GET","POST"])
@main.route("/login", methods=["GET","POST"])
def login():
    
    error=None
    
    # check the method called
    if request.method=="GET":

        # just render the login
        return render_template("login.html")
     
    if request.method=="POST":
        
        # check if it's the special user
        if request.form.get("email") == os.getenv("DEFAULT_USER"):

            #if request.form.get("password")==config["DEFAULT_USER_PWD"]:
            if request.form.get("password") == os.getenv("DEFAULT_USER_PWD"):
                
                # special user
                #add_log(datetime.datetime.now(tz=datetime.timezone.utc),config["DEFAULT_USER_NAME"],"Connected to the system!!!")
                add_log(datetime.datetime.now(tz=datetime.timezone.utc),os.getenv("DEFAULT_USER_NAME"),"Connected to the system!!!")
                
                # add the username to the session
                #session['username'] = config["DEFAULT_USER_NAME"]
                session['username'] = os.getenv("DEFAULT_USER_NAME")
                
                #return render_template('index.html',user_connected=config("DEFAULT_USER_NAME"))
                return redirect('index')

        
        # check if the user exists in the database with the good password
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_users_collection"]


        user = {
            "email": request.form.get("email"),
        }

        results= list(my_collection.find(user))
        find_record=False

        if (len(results)==0):
            # user not found
            error="User not found in the database!!!"
            return render_template("login.html",error=error)
        else :
                    
            for result in results:
                if check_password_hash(result["password"],request.form.get("password")):
            
                    # user found
                    add_log(datetime.datetime.now(tz=datetime.timezone.utc),request.form.get("email"),"Connected to the system!!!")
                    
                    # add the username to the session
                    session['username'] = result["name"]
                    
                    find_record=True

                    if session['username']!="":
                        return redirect('index')
                    else:
                        return redirect("login.html")
                    
            if find_record==False:
                
                # user not found
                error="User not found in the database!!!"
                return render_template("login.html",error=error)
                    

####################################################################################################################
####################################################################################################################
############  TEST ROUTE
####################################################################################################################
####################################################################################################################

@main.route("/test")
def test():
    if session['username']!="":
        #return render_template('index.html',version=config["ACTUAL_VERSION"],session_username=session['username'])
        return render_template('test.html',version=os.getenv("ACTUAL_VERSION"),session_username=session['username'])
    else:
        return redirect("login.html")
        

####################################################################################################################
####################################################################################################################
############  INDEX ROUTES
####################################################################################################################
####################################################################################################################

@main.route("/index")
def index():
    if session['username']!="":
        #return render_template('index.html',version=config["ACTUAL_VERSION"],session_username=session['username'])
        return render_template('index.html',version=os.getenv("ACTUAL_VERSION"),session_username=session['username'])
    else:
        return redirect("login.html")

####################################################################################################################
####################################################################################################################
############  USERS ROUTES
####################################################################################################################
####################################################################################################################


# route to display the user page
@main.route("/users")
def users():
    if session:
        if session['username']!="":
            return render_template('users.html',session_username=session['username'])
    else:
        return redirect("login")
    

# route providing data for the vue
@main.route("/usersVue")
def usersVue():
    
    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_users_collection"]
    
    # get all the logs
    my_users=my_collection.find()
        
    # just render the logs
    return json.loads(json_util.dumps(my_users))

@main.route("/usersVue/AddUser", methods=["POST"])
def usersVueAddUser():
    
    try :    
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_users_collection"]

        # converting password to array of bytes 
        pwd = generate_password_hash(request.form.get("password"))

        user = {
            "name": request.form.get("name"),
            "email": request.form.get("email"),
            "password": pwd,
            "role": request.form.get("role"),
        }
        
        # save the user in the database
        my_user=my_collection.insert_one(user)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"User " + str(my_user.inserted_id) + "  added to the system!!!")
        
        if (my_user.inserted_id):
            result={
                "status" : "OK",
                "message" : "User created!!!"
            }
            return jsonify(result)

        else :
            result={
                "status" : "NOK",
                "message" : "User not created!!!"
            }
            return jsonify(result)
        
    except:
        result={
            "status" : "NOK",
            "message" : "User not created!!!"
        }
        return jsonify(result)
        


@main.route("/usersVue/UpdateUser/<user_id>", methods=["PUT"])
def usersVueUpdateUser(user_id):

        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_users_collection"]

        my_collection.update_one(
            {'_id': ObjectId(user_id)}, 
                {"$set":
                    {
                        "name": request.form.get("name"),
                        "email": request.form.get("email"),
                        "role": request.form.get("role")
                    }
                }
            )
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"User " + user_id +  " updated!!!")
        
        # just render the users
        return jsonify(message="Record updated")


@main.route("/usersVue/DeleteUser", methods=["POST"])
def usersVueDeleteUser():

        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_users_collection"]

        user = {
            "_id": ObjectId(request.form.get("_id")),
        }
        
        # save the user in the database
        my_collection.delete_one(user)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"User " + str(request.form.get("_id")) + "  deleted from the system!!!")
        
        # just render the users
        return jsonify(message="Record deleted")

####################################################################################################################
####################################################################################################################
############  LOG ROUTES
####################################################################################################################
####################################################################################################################


@main.route("/logs")
def logs():
    
    if session:
        if session['username']!="":
            #my_prefix=config["APP_PREFIX_VALUE"]
            my_prefix=os.getenv("APP_PREFIX_VALUE")
            return render_template('logs.html',session_username=session['username'],my_prefix=my_prefix)
    else:
        return redirect("login")
    

@main.route("/logsVue")
def logsVue():

    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_logs_collection"]
    
    # get all the logs
    my_logs=my_collection.find(sort=[( "date", -1 )])
        
    # just render the logs
    return json.loads(json_util.dumps(my_logs))    
    
####################################################################################################################
####################################################################################################################
############  FIELDS ROUTES
####################################################################################################################
####################################################################################################################    

@main.route("/fields", methods=["GET"])
def fields():

    if session:
        if session['username']!="":
            return render_template('fields.html',session_username=session['username'])
    else:
        return redirect("login")


# route providing data for the vue
@main.route("/fieldsVue")
def fieldsVue():

   
    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_fields_collection"]
    
    # get all the logs
    my_field=my_collection.find()
        
    # just render the logs
    return json.loads(json_util.dumps(my_field))


@main.route("/fieldsVue/DeleteField", methods=["POST"])
def fieldsVueDeleteField():
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_fields_collection"]

        field = {
            "_id": ObjectId(request.form.get("_id")),
        }
        
        # save the field in the database
        my_collection.delete_one(field)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Field " + str(request.form.get("_id")) + "  deleted from the system!!!")
        
        # just render the users
        return jsonify(message="Record deleted")
    

@main.route("/fieldsVue/UpdateField/<field_id>", methods=["PUT"])
def fieldsVueUpdate(field_id):

        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_fields_collection"]

        my_collection.update_one(
            {'_id': ObjectId(field_id)}, 
                {"$set":
                    {
                        "name": request.form.get("name"),
                        "origin": request.form.get("origin"),
                        "recordid": request.form.get("recordid"),
                        "field": request.form.get("field"),
                        "subfield": request.form.get("subfield"),
                        "defaultvalue": request.form.get("defaultvalue")
                    }
                }
            )
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Field " + field_id +  " updated!!!")
        
        # just render the users
        return jsonify(message="Record updated")    
    
@main.route("/fieldsVue/AddField", methods=["POST"])
def fieldsVueAddField():

        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_fields_collection"]

        field = {
                "name": request.form.get("name"),
                "origin": request.form.get("origin"),
                "recordid": request.form.get("recordid"),
                "field": request.form.get("field"),
                "subfield": request.form.get("subfield"),
                "defaultvalue": request.form.get("defaultvalue")
        }
        
        # save the user in the database
        my_field=my_collection.insert_one(field)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Field " + str(my_field.inserted_id) + "  added to the system!!!")
        
        # just return the fields in json
        return json.loads(json_util.dumps(my_field.inserted_id))       

####################################################################################################################
####################################################################################################################
############  DATA MODELS ROUTES
####################################################################################################################
####################################################################################################################    


# route to display the datamodels page
@main.route("/dataModels")
def dataModels():
    
    if session:
        if session['username']!="":
            #my_prefix=config("APP_PREFIX_VALUE")
            return render_template('datamodels.html',session_username=session['username'])
    else:
        return redirect("login")
    

# route providing data for the vue
@main.route("/dataModelsVue")
def dataModelsVue():
    
    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_datamodels_collection"]
    
    # get all the logs
    my_field=my_collection.find()
        
    # just render the logs
    return json.loads(json_util.dumps(my_field))

# route providing data for the vue
@main.route("/fieldsForDataModelsVue")
def fieldsForDataModelsVue():

    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_fields_collection"]

    # get all the logs
    my_fields=my_collection.find()
        
    # just render the logs
    return json.loads(json_util.dumps(my_fields))
    
# route for the datamodels form
@main.route("/dataModelsVue/addDataModel", methods=["POST"])
def dataModelsVueAddDataModel():
    
    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_datamodels_collection"]

    datamodel = {
        "name":  request.form.get("name"),
        "listoffields": request.form.get("listoffields"),
        "isactive": request.form.get("isactive"),
    }
    
    # save the log in the database
    my_data_model=my_collection.insert_one(datamodel)
    
    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"New Data model added to the system!!!")
    
    # just render the users
    return json.loads(json_util.dumps(my_data_model.inserted_id))     



@main.route("/dataModelsVue/deleteDataModel", methods=["POST"])
def dataModelSVueDeleteDataModel():
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_datamodels_collection"]

        field = {
            "_id": ObjectId(request.form.get("_id")),
        }
        
        # save the field in the database
        my_collection.delete_one(field)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"DataModel " + str(request.form.get("_id")) + "  deleted from the system!!!")
        
        # just render the users
        return jsonify(message="Record deleted")
    

@main.route("/dataModelsVue/updateDataModel/<field_id>", methods=["PUT"])
def dataModelsVueUpdate(field_id):

        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_datamodels_collection"]

        my_collection.update_one(
            {'_id': ObjectId(field_id)}, 
                {"$set":
                    {
                        "name":  request.form.get("name"),
                        "listoffields": request.form.get("listoffields"),
                        "isactive": request.form.get("isactive"),
                    }
                }
            )
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"DataModel  " + field_id +  " updated!!!")
        
        # just render the users
        return jsonify(message="Record updated")   

####################################################################################################################
####################################################################################################################
############  LOGOUT ROUTE
####################################################################################################################
####################################################################################################################

@main.route('/logout')
def logout():
    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Disconnected from the system!!!")
    
    # remove the username from the session if it is there
    session.pop('username', None)
    return redirect('login')


####################################################################################################################
####################################################################################################################
############  DATASET ROUTE
####################################################################################################################
####################################################################################################################


# route to display the datasets page
@main.route("/datasets")
def datasets():
    
    if session:
        if session['username']!="":
            return render_template('datasets.html',session_username=session['username'])
    else:
        return redirect("login")
    
    

# route providing data for the vue
@main.route("/datasetsVue")
def datasetsVue():

    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_datasets_collection"]
    
    # get all the logs
    my_field=my_collection.find()
        
    # just render the logs
    return json.loads(json_util.dumps(my_field))


# route providing data for the vue
@main.route("/datamodelsForDatasetsVue")
def datamodelsForDatasetsVue():

    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_datamodels_collection"]

    # get all the logs
    my_fields=my_collection.find({"isactive":"Yes"})
        
    # just render the logs
    return json.loads(json_util.dumps(my_fields))

# route for the datamodels form
@main.route("/datasetsVue/addDataset", methods=["POST"])
def datasetsVueAddDataset():
    
    my_database = my_client["DynamicListings"]  
    my_collection = my_database["dl_datasets_collection"]

    dataset = {
        "name":  request.form.get("name"),
        "datamodel": request.form.get("datamodel"),
        "headersvalues": request.form.get("headersvalues"),
        "numberofheaders": request.form.get("numberofheaders"),
    }
    
    # save the log in the database
    my_dataset=my_collection.insert_one(dataset)
    
    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"New Dataset added to the system!!!")
    
    # just render the users
    return json.loads({json_util.dumps(my_dataset.inserted_id)})     


# route for the datamodels form
@main.route("/datasetsVue/executeDataset/<dataset_id>", methods=["POST"])
def datasetsVueExecuteDataset(dataset_id):
    
    # Definition of the collections
    my_database = my_client["DynamicListings"]  
    my_dataset = my_database["dl_datasets_collection"]
    my_datamodel = my_database["dl_datamodels_collection"]
    my_field = my_database["dl_fields_collection"]
    
    # Queries to get the dataset
    dataset = my_dataset.find_one({'_id': ObjectId(dataset_id)})
    
    # Results Object
    my_results={}
    my_results_record_global=[]
    
    # Queries to get the datamodel
    datamodel = my_datamodel.find_one({'_id': ObjectId(dataset["datamodel"])})

    # Extraction of the list of fields defined in the datamodel
    datamodel=json.loads(datamodel["listoffields"])
    
    for dm in datamodel:
        if dm["origin"]=="dlx":
            
            # extract the data based on the values from the fields 
            if (dm["field"]!="") and (dm["subfield"]!=""):
                try:
                    my_data= requests.get(config("BIB_PREFIX_VALUE") + dm["recordid"]  +"/fields/"+ dm["field"]  +"/0")
                    my_data=json.loads(my_data._content)
 
                    for subfield in my_data["data"]["subfields"]:
                        if subfield["code"]==dm["subfield"]:
                            
                            # Adding the day to the result
                            my_results_record={}
                            
                            # Storing the value provided by the API
                            my_results_record["field"]=dm["field"]
                            my_results_record["value"]=subfield["value"]
                            my_results_record["comment"]="ok"
                            my_results_record_global.append(my_results_record)

                    
                except:
                    pass
                
            else : 
                pass
                
        # create the global object + save
        date_of_the_day=today = str(date.today())
        my_results[date_of_the_day]=my_results_record_global
    
    # adding the results to the field results in the database
    my_dataset.update_one(
    {'_id': ObjectId(dataset_id)}, 
        {"$push":
            {
                "results":  my_results
            }
        }
    )
        
    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Execution of the dataset : " + str(dataset_id))
    
    # just render the users
    return json.loads(json_util.dumps(dataset))    


@main.route("/dataset/extract/<dataset_id>/<type>")
def datasetExtract(dataset_id,type):
    if type=="2":
        
    
        # define and query the dataset
        my_database = my_client["dl"]
        my_dataset = my_database["dl_datasets_collection"]
        
        # Queries to get the dataset
        dataset = my_dataset.find_one({'_id': ObjectId(dataset_id)})
        
        filename="/extract_dataset.json"

        with open(filename, "w") as outfile:
            json.dump(json.loads(json_util.dumps(dataset)), outfile)

        return send_file(filename, mimetype='application/x-csv', download_name=filename, as_attachment=True)


@main.route("/datasetVue/deleteDataset", methods=["POST"])
def datasetVueDeleteDataset():
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_datasets_collection"]

        field = {
            "_id": ObjectId(request.form.get("_id")),
        }
        
        # save the field in the database
        my_collection.delete_one(field)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Dataset " + str(request.form.get("_id")) + "  deleted from the system!!!")
        
        # just render the users
        return jsonify(message="Record deleted")
    
    
    
    
    

####################################################################################################################
####################################################################################################################
############  DATASET GA RESOLUTIONS ROUTE
####################################################################################################################
####################################################################################################################

# route to display the datamodels page
@main.route("/datasetGAResolutions")
def datasetGAResolutions():
    
    if session:
        if session['username']!="":
            return render_template('datasetgaresolutions.html',session_username=session['username'])
    else:
        return redirect("login")
    
    
# route to display the listings ID
@main.route("/getsclistingsId_ga")
def get_sc_listings_Id_ga():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_ga_res_data_collection"]

    # get all the listings_id
    my_field=my_collection.distinct("listing_id")
    
    # descending sort 
    my_fields=sorted(my_field,reverse=True)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  

def extract_resolution_number(res):
    match = re.search(r'(\d+)$', res)
    return int(match.group(1)) if match else 0


def extract_resolution_numeric_sort_key(res):
    if not isinstance(res, str):
        return 0
    match = re.search(r'(\d+)', res[::-1])  # reverse + match = last number
    return int(match.group(1)[::-1]) if match else 0


@main.route("/render_meeting_ga/<codemeeting>/<language>", methods=["GET"])
def render_meeting_ga(codemeeting,language):
    
    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_ga_res_data_collection"]

    # title
    Title_en=["Resolution No.","Plenary or Cttee","Agenda Item No","Meeting Record/ Date/ Vote","Draft","Title"]
    Title_fr=["No de résolution","Plénière ou Comité","No de l'ordre du jour","Compte rendu de séance / Date / Vote","Projet","Sujet"]
    Title_es=["Número de resolución", "Plenaria o Comisión", "Tema del programa", "Acta de la sesión/Fecha/Votación", "Proyecto de resolución", "Titulo"]
    
    if language=="EN":
        title=Title_en

    if language=="FR":
        title=Title_fr

    if language=="ES":
        title=Title_es


    # get all the listings_id
    my_records=my_collection.find({"listing_id":f"{codemeeting}"})

    
    data=[]
    # for record in my_records:
    for record in my_records:
        #print(record["Resolution"])
        data.append(record)
    sorted_data = sorted(data, key=lambda x: extract_resolution_numeric_sort_key(x["Resolution"]), reverse=True)    
    # just return the listings
    return render_template("render_ga.html",language=language,data=sorted_data,title=title)


# route to display the listings
@main.route("/exportjsonga/<meeting>", methods=["GET"])
def export_jsonga(meeting):

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_ga_res_data_collection"]

    # get all the listings_id
    my_fields=my_collection.find({"listing_id": meeting},{'_id': 0}).sort('listing_id',-1)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  


@main.route("/render_meeting_json_ga/<codemeeting>/json/<language>", methods=["GET"])
def render_meeting_json_ga(codemeeting,language):

    language = language.upper()    

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_ga_res_data_collection"]

    # get all the listings_id
    my_records=my_collection.find({"listing_id":f"{codemeeting}"}).sort("listing",-1)

    # Init our storage structures
    
    final={}
    my_index=0
    
    try:

        # Loop to feed our storage structure
        for data in my_records:
            print(data["Resolution"])
            recup_data={}# the display will take care of the selected language and check the availibity of the data before insert it to avoid error           

            #increment the index
            my_index+=1
            

            # Select the language
            if language=="EN":
                recup_data["Resolution No"]=data["Resolution_prefix_en"]+data["Resolution_en"]+data["Resolution_sufix_en"]
                recup_data["Plenary or Cttee"]=data["Plenary_en"]
                recup_data["Agenda Item No"]=data["Agenda_numbers_en"]
                recup_data["Meeting Record"]=data["Meeting_prefix_en"]+data["Meeting_en"]+data["Meeting_sufix_en"]
                recup_data["Date"]=data["date_en"]
                recup_data["Vote"]=data["Vote_prefix_en"]+data["Vote_en"]+data["Vote_sufix_en"]
                recup_data["Draft"]=data["Draft_Resolution_prefix_en"]+data["Draft_Resolution_en"]+data["Draft_Resolution_sufix_en"]
                recup_data["Topic"]=data["Title_en"]
               
            # Select the language
            if language=="FR":
                recup_data["Resolution No"]=data["Resolution_prefix_fr"]+data["Resolution_fr"]+data["Resolution_sufix_fr"]
                recup_data["Plénière ou Comité"]=data["Plenary_fr"]
                recup_data["Numéro de point à l'ordre du jour"]=data["Agenda_numbers_fr"]
                recup_data["Procès-verbal"]=data["Meeting_prefix_fr"]+data["Meeting_fr"]+data["Meeting_sufix_fr"]
                recup_data["Date"]=data["date_fr"]
                recup_data["Vote"]=data["Vote_prefix_fr"]+data["Vote_fr"]+data["Vote_sufix_fr"]
                recup_data["Projet"]=data["Draft_Resolution_prefix_fr"]+data["Draft_Resolution_fr"]+data["Draft_Resolution_sufix_fr"]
                recup_data["Sujet"]=data["Title_fr"]    

            # Select the language
            if language=="ES":
                recup_data["Resolution No"]=data["Resolution_prefix_es"]+data["Resolution_es"]+data["Resolution_sufix_es"]
                recup_data["Plenaria o Comité"]=data["Plenary_es"]
                recup_data["Número de Punto de Agenda"]=data["Agenda_numbers_es"]
                recup_data["Registro de Reunión"]=data["Meeting_prefix_fr"]+data["Meeting_fr"]+data["Meeting_sufix_fr"]
                recup_data["Fecha"]=data["date_es"]
                recup_data["Voto"]=data["Vote_prefix_es"]+data["Vote_es"]+data["Vote_sufix_es"]
                recup_data["Borrador"]=data["Draft_Resolution_prefix_es"]+data["Draft_Resolution_es"]+data["Draft_Resolution_sufix_es"]
                recup_data["Tema"]=data["Title_es"]    

            # loading the values in the
            final[my_index]=recup_data
    except :
        print(data["meeting_record"])
        print("An exception occurred")
        pass

    # just return the listings
    return jsonify(final)

####################################################################################################################
####################################################################################################################
############  DATASET SECURITY COUNSEL ROUTE
####################################################################################################################
####################################################################################################################

# route to display the datamodels page
@main.route("/datasetSecurityCounsel")
def datasetSecurityCounsel():
    
    if session:
        if session['username']!="":
            return render_template('datasetsecuritycounsel.html',session_username=session['username'])
    else:
        return redirect("login")

@main.route("/displayDatasetSecurityCounsel/<year>")
def displayDatasetsSecurityCounsel(year):
        
        # call the data from the query
        results=query_security_counsel_dataset(year)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"A query for the security counsel has been executed for year " + str(year))
        
        # just render the users
        return jsonify({'results': results})
    
    
# route to display the listings
@main.route("/getsclistings/<meeting>", methods=["GET"])
def get_sc_listings_values(meeting):

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]

    # get all the listings_id
    my_fields=my_collection.find({"listing_id": meeting}).sort('meeting_record',-1)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  

# route to display the listings
@main.route("/exportjson/<meeting>", methods=["GET"])
def export_json(meeting):

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]

    # get all the listings_id
    my_fields=my_collection.find({"listing_id": meeting},{'_id': 0}).sort('meeting_record',-1)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  

# route to display the listings ID
@main.route("/getsclistingsId")
def get_sc_listings_Id():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]

    # get all the listings_id
    my_field=my_collection.distinct("listing_id")
    
    # descending sort 
    my_fields=sorted(my_field,reverse=True)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  


@main.route("/update_sc_listing", methods=["PUT"])
def update_sc_listing():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]
    my_languague_selected=request.form.get("languageSelected")

    if (request.form.get("refresh")=="false"):
        my_refresh=False
    else:
        my_refresh=True
        
    recup=request.form.get("outcomes")
    recup=json.loads(recup)

    if my_languague_selected=="EN":
        my_collection.update_one(
            {'_id': ObjectId(request.form.get("_id"))}, 
                {"$set":
                    {
                        'meeting_record_en':request.form.get("meeting_record_en"),
                        'meeting_record_link':request.form.get("meeting_record_link"),
                        'date.0.value': request.form.get("date"),
                        'topic.0.value':request.form.get("topic"),
                        'outcomes':recup,                    
                        "refresh": my_refresh
                    }
                }
            )
        
    if my_languague_selected=="FR":
        my_collection.update_one(
            {'_id':   ObjectId(request.form.get("_id"))}, 
                {"$set":
                    {
                       'meeting_record_fr':request.form.get("meeting_record_fr"),
                        'meeting_record_link_fr':request.form.get("meeting_record_link_fr"),
                        'date.1.value': request.form.get("date"),
                        'topic.1.value':request.form.get("topic"),
                        'outcomes':recup,                          
                        "refresh": my_refresh
                    }
                }
            )
        
    if my_languague_selected=="ES":
        my_collection.update_one(
            {'_id':   ObjectId(request.form.get("_id"))}, 
                {"$set":
                    {
                       'meeting_record_es':request.form.get("meeting_record_es"),
                        'meeting_record_link_es':request.form.get("meeting_record_link_es"),
                        'date.2.value': request.form.get("date"),
                        'topic.2.value':request.form.get("topic"),
                        'outcomes':recup,                           
                        "refresh":my_refresh
                    }
                }
            )                    
    if my_languague_selected=="ES":            
        meeting=request.form.get("meeting_record_es")

    if my_languague_selected=="FR":            
        meeting=request.form.get("meeting_record_fr")
        
    if my_languague_selected=="EN":            
        meeting=request.form.get("meeting_record_en")
    
    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(meeting) +  " updated!!!")
    
    
    
    # just render the users
    return jsonify(message="Record updated")


@main.route("/create_sc_listing", methods=["POST"])
def create_sc_listing():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]
    
    # language selected
    my_languague_selected=request.form.get("languageSelected")
    
    # meeting record
    my_meeting_recorden=request.form.get("meeting_recorden")
    my_meeting_recordfr=request.form.get("meeting_recordfr")
    my_meeting_recordes=request.form.get("meeting_recordes")

    
    # record link
    
    my_meeting_record_link=request.form.get("meeting_record_link")
    my_meeting_record_link_fr=request.form.get("meeting_record_link_fr")
    my_meeting_record_link_es=request.form.get("meeting_record_link_es")
    
    # refresh
    if (request.form.get("refresh")=="false"):
        my_refresh=False
    else:
        my_refresh=True

    # listing id
    my_listing_id=request.form.get("listing_id")
    
    # date
    my_date=[
        {"lang":my_languague_selected,"value":request.form.get("date")},
        {"lang":"","value":""},
        {"lang":"","value":""}
    ]
    
    # topic
    my_topic=[
        {"lang":my_languague_selected,"value":request.form.get("topic")},
        {"lang":"","value":""},
        {"lang":"","value":""}
    ]
    
    # outcomes
    recup=request.form.get("outcomes")
    my_outcomes=json.loads(recup)
    dataset={}

    if my_languague_selected=="EN":
        dataset={
                        'meeting_record_link':my_meeting_record_link, 
                        'meeting_record_link_fr':my_meeting_record_link_fr, 
                        'meeting_record_link_es':my_meeting_record_link_es, 
                        'listing_id': my_listing_id,        
                        'meeting_record_en':my_meeting_recorden,
                        'meeting_record_fr':my_meeting_recordfr,
                        'meeting_record_es':my_meeting_recordes,
                        'date':my_date,
                        'topic':my_topic,
                        'outcomes':my_outcomes,                    
                        "refresh": my_refresh
                }
        
    if my_languague_selected=="FR":
        dataset={
                        'meeting_record_link':my_meeting_record_link, 
                        'meeting_record_link_fr':my_meeting_record_link_fr, 
                        'meeting_record_link_es':my_meeting_record_link_es, 
                        'listing_id': my_listing_id,        
                        'meeting_record_en':my_meeting_recorden,
                        'meeting_record_fr':my_meeting_recordfr,
                        'meeting_record_es':my_meeting_recordes,
                        'date': my_date,
                        'topic':my_topic,
                        'outcomes':my_outcomes,                    
                        "refresh": my_refresh
                }
        
    if my_languague_selected=="ES":
        dataset={
                        'meeting_record_link':my_meeting_record_link, 
                        'meeting_record_link_fr':my_meeting_record_link_fr, 
                        'meeting_record_link_es':my_meeting_record_link_es, 
                        'listing_id': my_listing_id,        
                        'meeting_record_en':my_meeting_recorden,
                        'meeting_record_fr':my_meeting_recordfr,
                        'meeting_record_es':my_meeting_recordes,
                        'date': my_date,
                        'topic':my_topic,
                        'outcomes':my_outcomes,                    
                        "refresh": my_refresh
                }
    
    # save the log in the database
    my_dataset=my_collection.insert_one(dataset)

    # create log
    if my_languague_selected=="EN":
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(my_meeting_recorden) +  " created!!!")
    
    if my_languague_selected=="FR":
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(my_meeting_recordfr) +  " created!!!")
    
    if my_languague_selected=="ES":
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(my_meeting_recordes) +  " created!!!")
    
    
    # just render the users
    return jsonify(message="Record created")
    
    
@main.route("/delete_sc_listing", methods=["POST"])
def delete_sc_listing():
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl_cd_data_collection"]

        record = {
            "_id": ObjectId(request.form.get("_id")),
        }
        
        # save the user in the database
        my_collection.delete_one(record)
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"SC Listing " + str(request.form.get("_id")) + "  deleted from the database!!!")
        
        # just render the users
        return jsonify(message="Record deleted")
    

@main.route("/render_meeting/<codemeeting>/<language>", methods=["GET"])
def render_meeting(codemeeting,language):
    
    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]

    # title
    title=""
    title_en=["Meeting Record","Date","Topic","Security Council Outcome/ Vote","Outcome","Vote"]
    title_fr=["Comptes rendus de séance","Date","Sujet","Issue des délibérations/Vote","Résultat","Vote"]
    title_es=["Acta de Sesión","Fecha","Tema","Consejo de Seguridad Resultado/ Votación","Resultado","Votar"]
    
    if language=="EN":
        title=title_en

    if language=="FR":
        title=title_fr

    if language=="ES":
        title=title_es


    # get all the listings_id
    my_records=my_collection.find({"listing_id":f"{codemeeting}"}).sort('meeting_record',-1)
    
    data=[]
    for record in my_records:
        data.append(record)

    year=data[0]["listing_id"][-4:]

    # just return the listings
    return render_template("render.html",language=language,data=data,title=title,year=year)


@main.route("/render_meeting/<codemeeting>/json/<language>", methods=["GET"])
def render_meeting_json(codemeeting,language):

    language = language.upper()    

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl_cd_data_collection"]

    # get all the listings_id
    my_records=my_collection.find({"listing_id":f"{codemeeting}"}).sort('meeting_record',-1)
   
    # Init our storage structures
    
    final={}
    my_index=0
    
    try:

        # Loop to feed our storage structure
        for data in my_records:
            
            recup_data={}# the display will take care of the selected language and check the availibity of the data before insert it to avoid error           

            #increment the index
            my_index+=1
            
            # Id management
            # recup_data["_id"]=data["_id"]

            # Meeting record management
            recup_data["meeting_record"]=data["meeting_record"]
            # if language=="EN":
            #     if "meeting_record" in data.keys():
            #         recup_data["meeting_record"]=data["meeting_record_en"]
            # if language=="FR":
            #     if "meeting_record_fr" in data.keys():
            #         recup_data["meeting_record"]=data["meeting_record_fr"]
            # if language=="ES":
            #     if "meeting_record_es" in data.keys():
            #         recup_data["meeting_record"]=data["meeting_record_es"]      
                        
            # Date management
            if language=="EN":
                if data["date"][0]:
                    print(data["date"][0])
                    recup_data["date"]=data["date"][0]["value"]
            if language=="FR":
                if data["date"][1]:
                    print(data["date"][1])
                    recup_data["date"]=data["date"][1]["value"]
            if language=="ES":
                if data["date"][2]:
                    recup_data["date"]=data["date"][2]["value"]
            
            # Meeting Record Link management
            if language=="EN":
                if "meeting_record_link" in data.keys():
                    recup_data["meeting_record_link"]=data["meeting_record_link"]
            if language=="FR":
                if "meeting_record_link_fr" in data.keys():
                    recup_data["meeting_record_link"]=data["meeting_record_link_fr"]
            if language=="ES":
                if "meeting_record_link_es" in data.keys():
                    recup_data["meeting_record_link"]=data["meeting_record_link_es"]        
                
            # listing Id management    
            if data["listing_id"]:   
                recup_data["listing_id"]=data["listing_id"]    
                
            # Outcomes Vote Management
            if data["outcomes"][0]["outcome_vote"]:
                recup_data["outcome_vote"]=data["outcomes"][0]["outcome_vote"]  
            
            # Outcome Text Management
           
            if language=="EN":
                # if data["outcomes"][0]["outcome"][0]["outcome_text"]:
                recup_data["outcome_text"]=data["outcomes"][0]["outcome"][0]["outcome_text"]
            if language=="FR":
                # if data["outcomes"][0]["outcome"][1]["outcome_text"]:
                recup_data["outcome_text"]=data["outcomes"][0]["outcome"][1]["outcome_text"]
            if language=="ES":
                # if data["outcomes"][0]["outcome"][2]["outcome_text"]:
                recup_data["outcome_text"]=data["outcomes"][0]["outcome"][2]["outcome_text"]        
            
            # Outcome Text Link Management

            if language=="EN":
                # if data["outcomes"][0]["outcome"][0]["outcome_text_link"]:
                recup_data["outcome_link"]=data["outcomes"][0]["outcome"][0]["outcome_text_link"]
            if language=="FR":
                # if data["outcomes"][0]["outcome"][1]["outcome_text_link"]:
                recup_data["outcome_link"]=data["outcomes"][0]["outcome"][1]["outcome_text_link"]
            if language=="ES":
                # if data["outcomes"][0]["outcome"][2]["outcome_text_link"]:
                recup_data["outcome_link"]=data["outcomes"][0]["outcome"][2]["outcome_text_link"]       
            
            # Topic Management
            if language=="EN":
                if data["topic"][0]["value"]:
                    recup_data["topic"]=data["topic"][0]["value"]
            if language=="FR":
                if data["topic"][1]["value"]:
                    recup_data["topic"]=data["topic"][1]["value"]
            if language=="ES":
                if data["topic"][2]["value"]:
                    recup_data["topic"]=data["topic"][2]["value"]                     
                    
                    
            # meeting record per language
            if language=="EN":
                if data["meeting_record_en"]:
                    recup_data["meeting_record_en"]=data["meeting_record_en"]
            
            if language=="FR":
                if data["meeting_record_fr"]:
                    recup_data["meeting_record_fr"]=data["meeting_record_fr"]
            
            if language=="ES":
                if data["meeting_record_es"]:
                    recup_data["meeting_record_es"]=data["meeting_record_es"]
            
            # loading the values in the
            final[my_index]=recup_data
    except :
        print(data["meeting_record"])
        print("An exception occurred")

    # just return the listings
    return jsonify(final)

# route to display the user page
@main.route("/refresh_data", methods=["POST"])
def refresh_data():
    if session:
        if session['username']!="":
            
            # logic to calsl the function to refresh the data
            my_year=request.form.get("year")
            my_month=request.form.get("month")
            try:
                refresh_scmo(my_year,my_month)
                return jsonify(message="The collection has been updated!!!")
            except:
                return jsonify(message="The collection has not been updated!!!")
            #refresh_scmo(int(my_year),int(my_month))
    else:
        # user not authentificated
        return redirect("login")

# route to display the user page
@main.route("/refresh_data_ga", methods=["POST"])
def refresh_data_ga():
    if session:
        if session['username']!="":
            
            # logic to calsl the function to refresh the data
            my_session=request.form.get("session")
            my_year=request.form.get("year")
            my_month=request.form.get("month")
            print(my_session,my_year,my_month)
            try:
                execute_refresh_ga(my_session,my_year,my_month)
                return jsonify(message="The collection has been updated!!!")
            except:
                return jsonify(message="The collection has not been updated!!!")
    else:
        # user not authentificated
        return redirect("login")

