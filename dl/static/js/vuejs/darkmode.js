Vue.component('darkmode',{
    props: [],
    template: `
    <template>
    <div>
        <DarkModeToggle @darkModeChange="handleDarkModeChange" />
        <p>Dark mode is {{ darkModeActive ? "enabled" : "disabled" }}.</p>
    </div>
    </template>

    <script>
    import DarkModeToggle from './components/DarkModeToggle.vue';

    export default {
    components: { DarkModeToggle },
    data() {
        return {
        darkModeActive: false,
        };
    },
    methods: {
        handleDarkModeChange(isDarkMode) {
        this.darkModeActive = isDarkMode;
        },
    },
    };
    </script>

    `,
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
  
    
  let app_darkmode = new Vue({
    el: '#darkmode'
    })
  
  
  
  