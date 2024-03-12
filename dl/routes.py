from werkzeug.security import check_password_hash, generate_password_hash
import json
from flask import Blueprint, jsonify, redirect, render_template,request,make_response, send_file, session,redirect, url_for
from pymongo import MongoClient
import datetime
from datetime import date
from .tools import add_log,query_security_counsel_dataset
from bson import json_util
from bson.objectid import ObjectId
import requests
from decouple import config

# definition of the Blueprint
main=Blueprint("main",__name__)

# connection to the database
#config = dotenv_values(".env") 
my_client = MongoClient(config("DATABASE_CONN"))
print(my_client)
    

    


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
        if request.form.get("email")==config("DEFAULT_USER_EMAIL"):

            if request.form.get("password")==config("DEFAULT_USER_PWD"):
                
                # special user
                add_log(datetime.datetime.now(tz=datetime.timezone.utc),config("DEFAULT_USER_NAME"),"Connected to the system!!!")
                
                # add the username to the session
                session['username'] = config("DEFAULT_USER_NAME")
                
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
                        return redirect("login")
                    
            if find_record==False:
                
                # user not found
                error="User not found in the database!!!"
                return render_template("login.html",error=error)
                    
        

####################################################################################################################
####################################################################################################################
############  INDEX ROUTES
####################################################################################################################
####################################################################################################################

@main.route("/index")
def index():
    if 'username' in session:
        return render_template('index.html',version=config("ACTUAL_VERSION"),session_username=session['username'])
    else:
        return redirect("login")

####################################################################################################################
####################################################################################################################
############  USERS ROUTES
####################################################################################################################
####################################################################################################################


# route to display the user page
@main.route("/users")
def users():

    if 'username' in session:
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
            print(result)
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
    
    if 'username' in session:
        my_prefix=config("APP_PREFIX_VALUE")
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

    if 'username' in session:
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
    
    if 'username' in session:
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
    
    if 'username' in session:
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
                    # print(my_data["data"]["subfields"])
                    for subfield in my_data["data"]["subfields"]:
                        if subfield["code"]==dm["subfield"]:
                            
                            # Adding the day to the result
                            # print(subfield["code"])
                            # print(subfield["value"])
                            my_results_record={}
                            
                            # Storing the value provided by the API
                            my_results_record["field"]=dm["field"]
                            my_results_record["value"]=subfield["value"]
                            my_results_record["comment"]="ok"
                            my_results_record_global.append(my_results_record)
                            print(my_results_record_global)
                    
                except:
                    pass
                
            else : 
                # extract the default values
                print("error")
                
        # create the global object + save
        date_of_the_day=today = str(date.today())
        my_results[date_of_the_day]=my_results_record_global
        print("-----------------------------------")
        print(my_results)
    
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
############  DATASET SECURITY COUNSEL ROUTE
####################################################################################################################
####################################################################################################################

# route to display the datamodels page
@main.route("/datasetSecurityCounsel")
def datasetSecurityCounsel():
    
    if 'username' in session:
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
    my_collection = my_database["dl5"]

    # get all the listings_id
    my_fields=my_collection.find({"listing_id": meeting}).sort('meeting_record',-1)
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  


# route to display the listings ID
@main.route("/getsclistingsId")
def get_sc_listings_Id():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl5"]

    # get all the listings_id
    my_fields=my_collection.distinct("listing_id")
    
    # just return the listings
    return json.loads(json_util.dumps(my_fields))  


@main.route("/update_sc_listing", methods=["PUT"])
def update_sc_listing():

        my_database=my_client["DynamicListings"]
        my_collection = my_database["dl5"]
        my_languague_selected=request.form.get("languageSelected")

        if my_languague_selected=="EN":
            my_collection.update_one(
                {'_id':   ObjectId(request.form.get("_id"))}, 
                    {"$set":
                        {
                            'meeting_record':request.form.get("record"),
                            'date.0.value': request.form.get("date"),
                            'topic.0.value':request.form.get("topic"),
                            'outcomes.0.outcome_vote':request.form.get("vote"),
                            'outcomes.0.outcome.0.outcome_text': request.form.get("security_council_document"),                            
                            "refresh": request.form.get("refresh")
                        }
                    }
                )
            
        if my_languague_selected=="FR":
            my_collection.update_one(
                {'_id':   ObjectId(request.form.get("_id"))}, 
                    {"$set":
                        {
                            'meeting_record':request.form.get("record"),
                            'date.1.value': request.form.get("date"),
                            'topic.1.value':request.form.get("topic"),
                            'outcomes.1.outcome_vote':request.form.get("vote"),
                            'outcomes.1.outcome.1.outcome_text': request.form.get("security_council_document"),                            
                            "refresh": request.form.get("refresh")
                        }
                    }
                )
            
        if my_languague_selected=="ES":
            my_collection.update_one(
                {'_id':   ObjectId(request.form.get("_id"))}, 
                    {"$set":
                        {
                            'meeting_record':request.form.get("record"),
                            'date.2.value': request.form.get("date"),
                            'topic.2.value':request.form.get("topic"),
                            'outcomes.2.outcome_vote':request.form.get("vote"),
                            'outcomes.2.outcome.2.outcome_text': request.form.get("security_council_document"),                            
                            "refresh": request.form.get("refresh")
                        }
                    }
                )                    
                    
        meeting=request.form.get("meeting_record")
        
        # create log
        add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(meeting) +  " updated!!!")
        
        # just render the users
        return jsonify(message="Record updated")


@main.route("/create_sc_listing", methods=["POST"])
def create_sc_listing():

    my_database=my_client["DynamicListings"]
    my_collection = my_database["dl5"]
    
    # language selected
    my_languague_selected=request.form.get("languageSelected")
    
    # meeting record
    my_meeting_record=request.form.get("meeting_record")
    
    # meeting record link
    my_meeting_record_link=request.form.get("meeting_record_link")

    # date
    my_date=[
        {"lang":"EN","value":request.form.get("date")},
        {"lang":"FR","value":request.form.get("date")},
        {"lang":"ES","value":request.form.get("date")}  
    ]
    
    # press release
    my_press_release=""
    
    # topic
    my_topic=[
        {"lang":"EN","value":request.form.get("topic")},
        {"lang":"FR","value":request.form.get("topic")},
        {"lang":"ES","value":request.form.get("topic")}  
    ]
    
    # refresh
    my_refresh=False
    
    # listing id
    my_listing_id=request.form.get("listing_id")
    
    # outcomes
    my_outcome=(
             {"lang":"EN","outcome_text":request.form.get("outcome_text")},
             {"lang":"FR","outcome_text":request.form.get("outcome_text")},
             {"lang":"ES","outcome_text":request.form.get("outcome_text")}
    )
    
    my_outcomes=[
        {
         "outcome_vote":request.form.get("outcome_vote"),
         "outcome":my_outcome
        }
    ]

    my_collection.insert_one(
                {
                    'meeting_record':my_meeting_record,
                    'meeting_record_link':my_meeting_record_link,
                    'date':my_date,
                    'press_release':my_press_release,
                    'topic':my_topic,
                    'refresh': my_refresh,
                    'listing_id': my_listing_id,
                    'outcomes':my_outcomes               
                })
            

    # create log
    add_log(datetime.datetime.now(tz=datetime.timezone.utc),session['username'],"Meeting record " + str(my_meeting_record) +  " created!!!")
    
    # just render the users
    return jsonify(message="Record created")
    
    
@main.route("/delete_sc_listing", methods=["POST"])
def delete_sc_listing():
        
        my_database = my_client["DynamicListings"]  
        my_collection = my_database["dl5"]
        print(request.form.get("_id"))
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
    my_collection = my_database["dl5"]

    # title
    title=""
    title_en=["Meeting","Date","Topic","Security Council","Outcome","Vote"]
    title_fr=["Réunion","Date","Sujet","Conseil de sécurité","Résultat","Vote"]
    title_sp=["Reunión","Fecha","Tema","Consejo de Seguridad","Resultado","Votar"]
    
    if language=="EN":
        title=title_en

    if language=="FR":
        title=title_fr

    if language=="SP":
        title=title_sp


    # get all the listings_id
    my_records=my_collection.find({"listing_id":f"{codemeeting}"})
    
    data=[]
    for record in my_records:
        # print(record["listing_id"])
        data.append(record)

    # just return the listings
    return render_template("render.html",language=language,data=data,title=title)