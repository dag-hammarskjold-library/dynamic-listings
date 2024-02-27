Vue.component('displaylistfieldscomponent',{
    props: ["title"],
    template: `
  <div class="page mt-3">
        <div class="alert alert-success" role="alert">
            <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
        </div>
        
        <!-- Button export / Creation -->
        <div class="mb-3">
          <button type="button" class="btn btn-success" @click="exportToExcel" v-if="showList">Extract to Excel</button>
          <button type="button" class="btn btn-primary" @click="showList=false;ShowCreateField=true;" v-if="showList">Create a new Field</button>
        </div>
        <div class="shadow">
            <!-- Messages -->
            <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
              <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </symbol>
              <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </symbol>
              <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </symbol>
            </svg>

            <!-- Button export / Creation -->
            <table class="table table-striped tableau" id="listlogs" v-if="showList">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Field Name</th>
                <th scope="col">Origin</th>
                <th scope="col">RecordID</th>
                <th scope="col">Field</th>
                <th scope="col">SubField</th>
                <th scope="col">Default Value</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="myfield in listOfFields">
                <td> {{myfield._id.$oid}} </td>
                <td> {{myfield.name}} </td>
                <td> {{myfield.origin}}</td>
                <td> {{myfield.recordid}}</td>
                <td> {{myfield.field}}</td>
                <td> {{myfield.subfield}}</td>
                <td> {{myfield.defaultvalue}}</td>
                <td><span class="badge rounded-pill bg-success mr-2"  @click="showList=false;field=myfield.field;defaultvalue=myfield.defaultvalue;fieldToUpdate=myfield._id.$oid;name=myfield.name;origin=myfield.origin;recordid=myfield.recordid;subfield=myfield.subfield;ShowUpdateField=true;">Update</span><span class="badge rounded-pill bg-danger" @click="deleteField(field._id.$oid)">Delete</span></td>
              </tr>
            </tbody>
            </table> 
        </div>

        <!-- Field Creation Form -->
        <div v-if="ShowCreateField">
            <hr> 
            <form @submit.prevent="createField">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3">
            <label for="role">Origin:</label>
                <select name="origin" id="origin"  v-model="origin">
                <option value="dlx"  selected>DLX</option>
                <option value="manual" >MANUAL INPUT</option>
                </select> 
            </div>    
            <div class="mb-3">
                <label for="inputRecordID" class="form-label">Record ID</label>
                <input type="text" class="form-control" id="recordid" name="recordid"  v-model="recordid">
            </div>
            <div class="mb-3">
                <label for="inputField" class="form-label">Field</label>
                <input type="text" class="form-control" id="field" name="field"  v-model="field">
            </div>
            <div class="mb-3">
                <label for="inputSubField" class="form-label">SubField</label>
                <input type="text" class="form-control" id="subfield" name="subfield"  v-model="subfield">
            </div>
            <div class="mb-3">
                <label for="inputDefaultValue" class="form-label">Default Value</label>
                <input type="text" class="form-control" id="defaultvalue" name="defaultvalue"  v-model="defaultvalue" required>
            </div>        
            <hr>      
            <button type="submit" class="btn btn-primary"> Save your record </button>
            <button class="btn btn-primary" @click="showList=true;ShowCreateField=false;location.reload()">Back to the list of fields </button>
            </form>
        </div>

        <!-- User Update Form -->
        <div v-if="ShowUpdateField">
            <hr> 
            <form @submit.prevent="updateField">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3">
            <label for="role">Origin:</label>
                <select name="origin" id="origin"  v-model="origin">
                <option value="dlx"  selected>DLX</option>
                <option value="manual" >MANUAL INPUT</option>
                </select> 
            </div>    
            <div class="mb-3">
                <label for="inputRecordID" class="form-label">Record ID</label>
                <input type="text" class="form-control" id="recordid" name="recordid"  v-model="recordid">
            </div>
            <div class="mb-3">
                <label for="inputField" class="form-label">Field</label>
                <input type="text" class="form-control" id="field" name="field"  v-model="field">
            </div>
            <div class="mb-3">
                <label for="inputSubField" class="form-label">SubField</label>
                <input type="text" class="form-control" id="subfield" name="subfield"  v-model="subfield">
            </div>
            <div class="mb-3">
                <label for="inputDefaultValue" class="form-label">Default Value</label>
                <input type="text" class="form-control" id="defaultvalue" name="defaultvalue"  v-model="defaultvalue" required>
            </div>        
            <hr>
            <button type="submit" class="btn btn-primary"> Update your record </button>
            <button class="btn btn-primary" @click="showList=true;ShowUpdateField=false;location.reload()">Back to the list of fields </button>
            </form>
        </div>

</div>`,
    data: function () {
      return {
        listOfFields:[],
        showList:true,
        showModal:false,
        ShowCreateField:false,
        ShowUpdateField:false,
        origin:"",
        recordid:"",
        name:"",
        field:"",
        subfield:"",
        defaultvalue:"",
        fieldToUpdate:"",
      }
    },
    created:async function(){
      try {
        const my_response = await fetch("/fieldsVue");
        const my_data = await my_response.json();
        my_data.forEach(element => {
          this.listOfFields.push(element)
        });
      } catch (error) {
        alert(error.message)
      }
    } 
    ,
    methods:{
      async createField(){
        try {
            let field = new FormData()
            field.append('name',this.name)
            field.append('origin',this.origin)
            field.append('recordid',this.recordid)
            field.append('field',this.field)
            field.append('subfield',this.subfield)
            field.append('defaultvalue',this.defaultvalue)
            const my_response = await fetch("/fieldsVue/AddField", {
              "method":"POST",
              "body":field
            });
            const my_data = await my_response.json();
            alert("New Field Created!!!")
          
          } catch (error) {
          alert(error.message)
        }
      },
      async updateField(){
        try {
            let field = new FormData()
            field.append('name',this.name)
            field.append('origin',this.origin)
            field.append('recordid',this.recordid)
            field.append('field',this.field)
            field.append('subfield',this.subfield)
            field.append('defaultvalue',this.defaultvalue)
            const my_response = await fetch("/fieldsVue/UpdateField/" + this.fieldToUpdate , {
              "method":"PUT",
              "body":field
            });
          alert(`User ${this.fieldToUpdate} updated!!!`)
          location.reload()
          } catch (error) {
          alert(error.message)
        }
      },
      async deleteField(fieldID){
          try {
              let that=this
              if (confirm(`Do you really want to delete the record with the _id : ${fieldID} ? `) == true) {
              let field = new FormData()
              field.append('_id',fieldID)
              const my_response = await fetch("/fieldsVue/DeleteField", {
                "method":"POST",
                "body":field
              });
              const my_data = await my_response.json();              
              alert(`Field with the _id : ${fieldID} has been deleted!!!`)
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
  
    
  let app_fields = new Vue({
    el: '#dlfields'
    })
  
  
  
  