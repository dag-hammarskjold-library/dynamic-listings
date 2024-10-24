/////////////////////////////////////////////////////////////////
// LOGS COMPONENT
/////////////////////////////////////////////////////////////////

Vue.component('displaylistcomponent',{
  props: ["title","prefix"],
  template: `
  <div class="page mt-3">
      <div class="alert alert-success" role="alert">
          <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
      </div>
      <div class="mb-3">
        <button type="button" class="btn btn-success" @click="exportToExcel" ><i class="far fa-file-excel"></i>  Extract to Excel</button>
      </div>
      <div class="shadow">
          <table class="table table-striped tableau" id="listlogs">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Action</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in listOfFields">
              <th scope="row"> {{field.user}} </th>
              <td>{{field.action}}</td>
              <td>{{field.date.$date}}</td>
            </tr>
          </tbody>
          </table>       
      </div>
  </div> 

  `,
  data: function () {
    return {
      listOfFields:[],
    }
  },
  created:async function(){
    const my_response = await fetch(this.prefix);
    const my_data = await my_response.json();
    my_data.forEach(element => {
      this.listOfFields.push(element)
    });
  },
  methods:{
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

  
let app_logs = new Vue({
  el: '#dllogs'
  })

  //getting all the logs from the database


