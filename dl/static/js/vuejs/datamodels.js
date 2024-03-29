Vue.component('displaylistdatamodelscomponent',{
    props: ["title"],
    template: `
  <div class="page mt-3">
        <div class="alert alert-success" role="alert">
            <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
        </div>
        
        <!-- Button export / Creation -->
        <div class="mb-3">
          <button type="button" class="btn btn-success" @click="exportToExcel" v-if="showList">Extract to Excel</button>
          <button type="button" class="btn btn-primary" @click="showList=false;showCreateDataModel=true;" v-if="showList">Create a new Datamodel</button>
        </div>
        <div class="shadow" v-if="showList && listOfDataModels.length > 0" >
            <!-- Button export / Creation 
            <table class="table table-striped tableau" id="listdatamodels" v-if="showList && listOfDataModels.length > 0 ">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">List Of Fields</th>
                <th scope="col">Is Active</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in listOfDataModels">
                <td> {{field._id.$oid}} </td>
                <td> {{field.name}} </td>
                <td> {{field.listoffields}} </td>
                <td> {{field.isactive}} </td>
                <td><span class="badge rounded-pill bg-success mr-2"  @click="reloadTable(field.listoffields);showList=false;dataModelToUpdate=field._id.$oid;name=field.name;isActive=field.isactive;showUpdateDataModel=true;">Update</span><span class="badge rounded-pill bg-danger" @click="deleteDataModel(field._id.$oid)">Delete</span></td>
              </tr>
            </tbody>
            </table>  -->
            <!-- Accordeon experiment -->
            <div class="row" v-for="field in listOfDataModels">
              <div class="col mt-1 shadow border border-success ">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title"><strong> ID : </strong>{{field._id.$oid}} </h5>
                    <p class="card-text"><strong> Name : </strong> {{field.name}}</p>
                    <p class="card-text"><strong> List of Fields : </strong> {{field.listoffields}}</p>
                    <p class="card-text"><strong> Is Active ? : </strong> {{field.isactive}}</p>
                    <strong>  Actions : </strong><span class="badge rounded-pill bg-success mr-2"  @click="reloadTable(field.listoffields);showList=false;dataModelToUpdate=field._id.$oid;name=field.name;isActive=field.isactive;showUpdateDataModel=true;">Update</span><span class="badge rounded-pill bg-danger" @click="deleteDataModel(field._id.$oid)">Delete</span>                
                  </div>
                </div>
              </div>            
            </div>

        </div>

        <!-- DataMode; Creation Form -->
        <div v-if="showCreateDataModel">
            <hr> 
            <form @submit.prevent="">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3">
                <label for="role"> List Of Fields </label>
                <select id="fieldselected">
                        <option v-for="field in listOfFieldsNames">{{field._id.$oid}} || {{field.name}} || {{field.origin}} || {{field.recordid}} || {{field.field}} || {{field.subfield}} || {{field.defaultvalue}} </option>
                </select>
                <button class="btn btn-secondary" @click="addField"> Add this field </button> 
                <table class="table table-striped tableau mt-3" id="listfields" v-if="listOfFieldSelected.length>0" >
                <thead>
                  <tr>
                    <th scope="col">ID </th>
                    <th scope="col">Name</th>
                    <th scope="col">Origin</th>
                    <th scope="col">RecordID</th>
                    <th scope="col">Field Value</th>
                    <th scope="col">Subfield Value</th>
                    <th scope="col">Default Value</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in listOfFieldSelected">
                    <td> {{field._id.$oid}} </td>
                    <td> {{field.name}} </td>
                    <td> {{field.origin}} </td>
                    <td> {{field.recordid}} </td>
                    <td> {{field.field}} </td>
                    <td> {{field.subfield}} </td>
                    <td> {{field.defaultvalue}} </td>
                    <td><span class="badge rounded-pill bg-success" @click="removeField(field._id.$oid)">Remove this field</span></td>
                  </tr>
                </tbody>
                </table>     
            </div>    
            <div class="mb-3">
              <label for="inputName" class="form-label">Activation of the Datamodel? </label>
              <select class="form-select" aria-label="Default select example" name="isActive" v-model="isActive">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>  
            </div>
           
            <hr>      
            <button @click="createDataModel()" class="btn btn-primary"> Save your record </button>
            <button class="btn btn-primary" @click="showList=true;showCreateDataModel=false;location.reload()">Back to the list of datamodels </button>
            </form>
        </div>

        <!-- User Update Form -->
        <div v-if="showUpdateDataModel">
            <hr> 
            <form @submit.prevent="">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3">
                <label for="role"> List Of Fields </label>
                <select id="fieldselected">
                        <option v-for="field in listOfFieldsNames">{{field._id.$oid}} || {{field.name}} || {{field.origin}} || {{field.recordid}} || {{field.field}} || {{field.subfield}} || {{field.defaultvalue}} </option>
                </select>
                <button class="btn btn-secondary" @click="addField"> Add this field </button> 
                <table class="table table-striped tableau mt-3" id="listfields" v-if="listOfFieldSelected.length>0">
                <thead>
                  <tr>
                  <th scope="col">ID </th>
                  <th scope="col">Name</th>
                  <th scope="col">Origin</th>
                  <th scope="col">RecordID</th>
                  <th scope="col">Field Value</th>
                  <th scope="col">Subfield Value</th>
                  <th scope="col">Default Value</th>
                  <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in listOfFieldSelected">
                  <td> {{field._id.$oid}} </td>
                  <td> {{field.name}} </td>
                  <td> {{field.origin}} </td>
                  <td> {{field.recordid}} </td>
                  <td> {{field.field}} </td>
                  <td> {{field.subfield}} </td>
                  <td> {{field.defaultvalue}} </td>
                    <td><span class="badge rounded-pill bg-success" @click="removeField(field)">Remove this field</span></td>
                  </tr>
                </tbody>
                </table>     
            </div>    
            <div class="mb-3">
              <label for="inputName" class="form-label">Activation of the Datamodel? </label>
              <select class="form-select" aria-label="Default select example" name="isActive" v-model="isActive">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>   
            </div>               
            <hr>      
            <button @click="updateDataModel()" class="btn btn-primary"> Update your record </button>
            <button class="btn btn-primary" @click="showList=true;showUpdateDataModel=false;location.reload()">Back to the list of datamodels </button>
            </form>
        </div>

</div>`,
    data: function () {
      return {
        listOfDataModels:[],
        showList:true,
        showCreateDataModel:false,
        showUpdateDataModel:false,
        recordid:"",
        name:"",
        listOfFieldsNames:[],
        listOfFieldSelected:[],
        listOfFields:[],
        isActive:"",
        dataModelToUpdate:"",
      }
    },
    created:async function(){
      try {
        const my_response = await fetch("/dataModelsVue");
        const my_data = await my_response.json();
        my_data.forEach(element => {
          this.listOfDataModels.push(element)
        });
        this.importFields()
      } catch (error) {
        alert(error.message)
      }
    } 
    ,
    methods:{
        reloadTable(myString){
            let recup=JSON.parse(myString)
            let recup1=[]
            recup.forEach((element)=>{
              recup1.push(element)
            })

            recup1.forEach((element1)=>{
              this.listOfFieldsNames.forEach((element2)=>{
                if (element1._id.$oid==element2._id.$oid){
                  this.listOfFieldSelected.push(element2)
                }
              })
            })
        },

        addField(){
            // Get the value of the field selected
            let field = document.getElementById("fieldselected").value;
            // Get the ID of the Field selected
            let myID=field.split("||")
            if (this.listOfFields.includes(field)==false){ 
              this.listOfFields.push(field)
              this.listOfFieldsNames.forEach((element)=>{
                  if (element._id.$oid==myID[0].trim()){
                    // Add this record inside the list of fields selected
                    this.listOfFieldSelected.push(element)
                  }
              })
            } else {
              alert(`This field:${field} is already selected`)
            }
        },
        removeField(myField){
            // Remove data from listoffields
            this.listOfFields=this.listOfFields.filter((item)=>{
                return item!==myField
            })
            // Remove data from listoffieldsSelected
            myID=myField
            this.listOfFieldsNames.forEach((element)=>{
              if (element._id.$oid==myID){
                // Add this record inside the list of fields selected
                this.listOfFieldSelected.push(element)
                this.listOfFieldSelected=this.listOfFieldSelected.filter((item)=>{
                  return item!==element
                }
            )}
          })
        },
        async importFields(){
            try {
                const my_response = await fetch("/fieldsForDataModelsVue");
                const my_data = await my_response.json();
                my_data.forEach(element => {
                  this.listOfFieldsNames.push(element)
                });
              } catch (error) {
                alert(error.message)
              }
            },  
      async createDataModel(){
        if (this.listOfFieldSelected.length>0){
            try {
                let dataModel = new FormData()
                dataModel.append('name',this.name)
                dataModel.append('listoffields',JSON.stringify(this.listOfFieldSelected))
                dataModel.append('isactive',this.isActive)
                const my_response = await fetch("/dataModelsVue/addDataModel", {
                "method":"POST",
                "body":dataModel
                });
                const my_data = await my_response.json();
                alert("New DataModel Created!!!")
            
            } catch (error) {
            alert(error.message)
            }
        }
        else {
            alert("Please add some Fields!!!")
        }
      },
      async updateDataModel(){
        try {
            let dataModel = new FormData()
            dataModel.append('name',this.name)
            // let recup=this.listOfFields.toString().split(',');
            dataModel.append('listoffields',JSON.stringify(this.listOfFieldSelected))
            dataModel.append('isactive',this.isActive)
            const my_response = await fetch("/dataModelsVue/updateDataModel/" + this.dataModelToUpdate , {
              "method":"PUT",
              "body":dataModel
            });
          alert(`DataModel ${this.dataModelToUpdate} updated!!!`)
          location.reload()
          } catch (error) {
          alert(error.message)
        }
      },
      async deleteDataModel(dataModelID){
          try {
              if (confirm(`Do you really want to delete the record with the _id : ${dataModelID} ? `) == true) {
              let dataModel = new FormData()
              dataModel.append('_id',dataModelID)
              const my_response = await fetch("/dataModelsVue/deleteDataModel", {
                "method":"POST",
                "body":dataModel
              });
              const my_data = await my_response.json();              
              alert(`DataModel with the _id : ${dataModelID} has been deleted!!!`)
              location.reload()
              }
            } catch (error) {
            alert(error.message)
          }
      },      
      exportToExcel() {
          // Variable to store the final csv data
          let csv_data = [];
       
          // Get each row data
          let rows = document.getElementsByTagName('tr');
          for (let i = 0; i < rows.length; i++) {
       
              // Get each column data
              let cols = rows[i].querySelectorAll('td,th');
       
              // Stores each csv row data
              let csvrow = [];
              for (let j = 0; j < cols.length; j++) {
       
                  // Get the text data of each cell of
                  // a row and push it to csvrow
                  csvrow.push(cols[j].innerHTML);
              }
       
              // Combine each column value with comma
              csv_data.push(csvrow.join(","));
          }
          // combine each row data with new line character
          csv_data = csv_data.join('\n');
       
          // Call this function to download csv file 
          this.downloadCSVFile(csv_data);
      },
      downloadCSVFile(csv_data) {
   
        // Create CSV file object and feed
        // our csv_data into it
        CSVFile = new Blob([csv_data], {
            type: "text/csv"
        });
      
        // Create to temporary link to initiate
        // download process
        let temp_link = document.createElement('a');
      
        // Download csv file
        temp_link.download = "results_upload.csv";
        let url = window.URL.createObjectURL(CSVFile);
        temp_link.href = url;
      
        // This link should not be displayed
        temp_link.style.display = "none";
        document.body.appendChild(temp_link);
      
        // Automatically click the link to
        // trigger download
        temp_link.click();
        document.body.removeChild(temp_link);
      }
    },
    components: {}
  }
  )
  
    
  let app_datamodels = new Vue({
    el: '#dldatamodels'
    })
  
  
  
  