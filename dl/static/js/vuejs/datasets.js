Vue.component('displaylistdatasetscomponent',{
    props: ["title"],
    template: `
     <div class="page mt-3" id="test">
        <div class="alert alert-success" role="alert">
            <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
        </div>


        <!-- Button export / Creation -->
        <div class="mb-3">
          <button type="button" class="btn btn-success" @click="exportToExcel" v-if="showList">Extract to Excel</button>
          <button type="button" class="btn btn-primary" @click="showList=false;showCreateDataset=true;" v-if="showList">Create a new Dataset </button>
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

            <!-- Accordeon experiment -->
            <div class="row" v-for="field in listOfDatasets" v-if="showList && listOfDatasets.length > 0 ">
              <div class="col mt-1 shadow border border-success ">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title"><strong> ID : </strong>{{field._id.$oid}} </h5>
                    <p class="card-text"><strong> Name : </strong> {{field.name}}</p>
                    <p class="card-text"><strong> DataModel : </strong> {{field.datamodel}}</p>
                    <p class="card-text"><strong> List Of Headers Values : </strong> {{field.headersvalues}}</p>
                    <p class="card-text"><strong> Number of Headers : </strong> {{field.numberofheaders}}</p>
                    <p class="card-text"><strong> Results : </strong> </p>
                    <ul>
                        <li v-for="field in field.results" class="text-primary" > {{field}} </li>
                    </ul>
                    <strong>  Actions : <span class="badge rounded-pill bg-danger" @click="showDeleteConfirmation(field._id.$oid)">Delete</span><span class="badge rounded-pill bg-warning" @click="executeDataset(field._id.$oid)">Execute</span><span class="badge rounded-pill bg-dark" @click="extract(field,1)">HTML View</span></span><span class="badge rounded-pill bg-info" @click="extract(field,2)">JSON View</span>                
                  </div>
                </div>
              </div>            
            </div>                      
        </div>

        <!-- create Dataset Form -->
        <div v-if="showCreateDataset">
            <hr> 
            <form @submit.prevent="">
            <div class="mb-3" v-if="listOfDatamodelsNames.length>0">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3" v-if="listOfDatamodelsNames.length>0">
                <label for="inputfieldselected" class="form-label">DataModel</label>
                <select id="fieldselected" v-model="actualDataModel" @change="resetHeader()">
                        <option v-for="field in listOfDatamodelsNames" >{{field._id.$oid}} || {{field.name}} </option>
                </select>
            </div>
            <div class="mb-3" v-if="actualDataModel">
                <label for="inputName" class="form-label">Headers Values </label>
                <input type="text" class="form-control" id="header" name="header" v-model="header"> 
                <button class="btn btn-secondary mt-2" @click="addHeader()"> Add this Header </button> 
                <table class="table table-striped tableau mt-3" id="listfields" v-if="listOfHeaders.length>0">
                <thead>
                  <tr>
                    <th scope="col">Name of the Header</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in listOfHeaders">
                    <td> {{field}} </td>
                    <td><span class="badge rounded-pill bg-success" @click="removeHeader(field)">Remove this header</span></td>
                  </tr>
                </tbody>
                </table>     
            
                

            </div>    
             

            <div v-if="listOfDatamodelsNames.length==0"> 
                <div class="alert alert-danger" role="alert">
                  No active DataModel available!!!!
                </div>
            </div>
            <hr>      
            <button v-if="listOfDatamodelsNames.length>0" @click="createDataset();showList=true;showCreateDataset=false;location.reload()" class="btn btn-primary"> Create your dataset </button>
            <button class="btn btn-primary" @click="showList=true;showCreateDataset=false;location.reload()">Back to the list of datasets </button>
            </form>
        </div>



        <!-- update Dataset Form -->
        <div v-if="showViewDataset">

        </div>

</div>`,
    data: function () {
      return {
        listOfDatasets:[],
        listOfHeaders:[],
        actualDataModel:"",
        header:"",
        showList:true,
        showCreateDataset:false,
        showViewDataset:false,
        recordid:"",
        name:"",
        listOfDatamodelsNames:[],
        numberOfHeadersDataModel:"",
        listOfFields:[],
        isActive:"",
        dataModelToUpdate:"",
      }
    },
    created:async function(){
      try {
        const my_response = await fetch("/datasetsVue");
        const my_data = await my_response.json();
        my_data.forEach(element => {
          this.listOfDatasets.push(element)
        });
        this.importDataModels()
      } catch (error) {
        showError(error.message)
      }
    } 
    ,
    methods:{
        resetHeader(){
          this.listOfHeaders=[]
        },
        getNumberOfHeaders(myValue){
          let myID=myValue.split('||')
          let number=0
          this.listOfDatamodelsNames.forEach((item)=>{
            if (item._id.$oid===myID[0].trim()){
              let recup=JSON.parse(item.listoffields)
              number=recup.length
              }
          })
          return number
        },
        formatLOF(myString){
            let recup = myString.replace('[','').replace(']','').replace('"','').replace('"','').replace('"','').replace('"','')
            ok=recup.split(',')
            ok.forEach((element)=>{
                this.listOfFields.push(element)
            })
        },
        addHeader(){
            if (this.listOfHeaders.length < this.getNumberOfHeaders(this.actualDataModel)){
            let field = document.getElementById("header").value;
            (this.listOfHeaders.includes(field)==false)? this.listOfHeaders.push(field) : showWarning(`This header value ${field} is already selected`)
            } else {
              showWarning(`You reached the number of headers defined for this datamodel!!!!`)
            }
        },
        removeHeader(myField){
            this.listOfHeaders=this.listOfHeaders.filter((item)=>{
                return item!==myField
            })
        },
        async importDataModels(){
            try {
                const my_response = await fetch("/datamodelsForDatasetsVue");
                const my_data = await my_response.json();
                my_data.forEach(element => {
                  this.listOfDatamodelsNames.push(element)
                });
              } catch (error) {
                showError(error.message)
              }
            },  
      async createDataset(){
        
        // check if the number of fields from header is equal to datamodel fields before saving
        if (this.listOfHeaders.length === this.getNumberOfHeaders(this.actualDataModel)){
            try {

                let dataset = new FormData()
                dataset.append('name',this.name)
                dataset.append('datamodel',this.actualDataModel.split('||')[0].trim())
                dataset.append('headersvalues',JSON.stringify(this.listOfHeaders))
                dataset.append('numberofheaders',this.getNumberOfHeaders(this.actualDataModel))

                const my_response = await fetch("/datasetsVue/addDataset", {
                "method":"POST",
                "body":dataset
                });
                const my_data = await my_response.json();
                showSuccess("New Dataset Created!!!")
            
            } catch (error) {
            showError(error.message)
            }

        } else {
          showWarning(` ${this.getNumberOfHeaders(this.actualDataModel)- this.listOfHeaders.length} Headers should be added to the tablel!!!!`)
        }
      },
      async updateDataModel(){
        try {
            let dataModel = new FormData()
            dataModel.append('name',this.name)
            let recup=this.listOfFields.toString().split(',');
            dataModel.append('listoffields',JSON.stringify(recup))
            dataModel.append('isactive',this.isActive)
            const my_response = await fetch("/dataModelsVue/updateDataModel/" + this.dataModelToUpdate , {
              "method":"PUT",
              "body":dataModel
            });
          showSuccess(`DataModel ${this.dataModelToUpdate} updated!!!`)
          location.reload()
          } catch (error) {
          showError(error.message)
        }
      },
      showDeleteConfirmation(dataModelID) {
        console.log('showDeleteConfirmation called for dataset:', dataModelID);
        
        // Create a simple, robust modal
        const modal = document.createElement('div');
        modal.id = 'deleteConfirmationModal';
        modal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 99999 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
          background: var(--white, #ffffff) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          padding: 15px !important;
          border-left: 4px solid var(--warning-color, #ffc107) !important;
          max-width: 280px !important;
          width: 90% !important;
          text-align: center !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 10px !important;
        `;
        
        modalContent.innerHTML = `
          <div class="notification-icon" style="color: var(--warning-color, #ffc107); font-size: 24px;">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="notification-content" style="text-align: center;">
            <div class="notification-title" style="font-weight: 600; margin-bottom: 5px; color: var(--dark, #333); font-size: 14px;">Confirm Deletion</div>
            <div class="notification-message" style="color: var(--text-color, #666); margin-bottom: 10px; font-size: 12px;">
              Delete dataset with ID: <strong>${dataModelID}</strong>?
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 0px;">
            <button id="confirmDeleteBtn" style="
              background: var(--danger-color, #dc3545) !important;
              color: white !important;
              border: none !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 12px !important;
              cursor: pointer !important;
              font-weight: 500 !important;
            ">Delete</button>
            <button id="cancelDeleteBtn" style="
              background: var(--secondary-color, #6c757d) !important;
              color: white !important;
              border: none !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 12px !important;
              cursor: pointer !important;
              font-weight: 500 !important;
            ">Cancel</button>
          </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('confirmDeleteBtn').onclick = () => {
          this.confirmDeleteDataset(dataModelID);
          document.body.removeChild(modal);
        };
        
        document.getElementById('cancelDeleteBtn').onclick = () => {
          document.body.removeChild(modal);
        };
        
        // Close on backdrop click
        modal.onclick = (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
          }
        };
      },
      
      async confirmDeleteDataset(dataModelID){
          try {
              let dataset = new FormData()
              dataset.append('_id',dataModelID)
              const my_response = await fetch("/datasetVue/deleteDataset", {
                "method":"POST",
                "body":dataset
              });
              const my_data = await my_response.json();              
              showSuccess(`Dataset with the _id : ${dataModelID} has been deleted!!!`)
              location.reload()
            } catch (error) {
            showError(error.message)
          }
      }, 
      async executeDataset(datasetID){
        try {
          const my_response = await fetch("/datasetsVue/executeDataset/" + datasetID,
          {
            "method":"POST",
          });
          const my_data = await my_response.json();
          showSuccess(`Dataset ${datasetID} has been executed`)
          location.reload()
        } catch (error) {
          showError(error.message)
        }
      }, 
      async extract(field,type){
        try {
          if (type==2) // JSON extract
          {
            showSuccess("Your data has been extracted with JSON format!!!")
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(field));
            element.setAttribute('download', `extract_${field._id.$oid}.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
          }
          if (type==1) // HTML extract
          {
              let my_html_boilerplate= `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Data Extract</title>
                    <link rel="stylesheet" href="style.css">
                  </head>
                  <body>
                  <div id="data" class="shadow">   </div>
                  <script src=""></script>
                  </body>
                </html>
              `
              // get the div
              // let myData=document.getElementById("data")
              // let table = document.createElement('table');
              // let tableBody = document.createElement('tbody');

              // create the row for the tbody
              // let rowTbody = document.createElement('tr');
              // this.listOfHeaders.forEach((elenent)=>{
              //   let cell = document.createElement('td');
              //   cell.appendChild(document.createTextNode(elenent));
              //   rowTbody.appendChild(cell);
              // })
              
              // tableBody.appendChild(rowTbody);
              // table.appendChild(tableBody);
              // myData.appendChild(table);
              let myData=document.getElementById("test")
              my_html_boilerplate=myData
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + my_html_boilerplate);
              element.setAttribute('download', `extract_${field._id.$oid}_table.html`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
          }
        } catch (error) {
          showError(error.message)
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
  
    
  let app_datasets = new Vue({
    el: '#dldatasets'
    })
  
  
  
  