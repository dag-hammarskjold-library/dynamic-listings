Vue.component('displaylistdatasetssecuritycounselcomponent',{
    props: ["title",'prefix'],
    template: `
     <div class="page mt-3" id="test">
        <div class="alert alert-success" role="alert">
            <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
        </div>
        <hr>
        <div class="mb-3">
            <div v-if="initPage==true">
              <label for="browser" class="form-label"><strong>Choose your meeting from the list:</strong></label>
              <select class="form-select" aria-label="Default select example" name="listofmeetings"  id="listofmeetings" >
                <option v-for="meeting in meetingsIds" v-bind:value="meeting">{{meeting}}</option>
              </select> 
              <label for="listoflanguages" class="form-label"><strong>Choose your language from the list:</strong></label>
              <select class="form-select" aria-label="Default select example" name="listoflanguages" id="listoflanguages">
                <option value="FR">French</option>
                <option value="EN" selected="selected">English</option>
                <option value="ES">Spanish</option>
                <!-- <option value="RU">Russian</option>
                <option value="AR">Arabic</option>
                <option value="ZH">Chinese</option> -->
              </select>
              <button type="button" class="btn btn-success mt-2" @click="displayData('listofmeetings','listoflanguages')">Display the table</button> 
              <button type="button" class="btn btn-warning mt-2" @click="openFTP()">Upload HTML file to the server</button>  
            </div>
            <div v-if="displayRecordFromQuery">
              <button type="button" class="btn btn-success" @click="exportExcel('myTable')">Extract to Excel</button>
              <button type="button" class="btn btn-secondary" @click="exportHTML()">Extract to HTML</button>
              <button type="button" class="btn btn-primary" @click="document.location.reload(true);">Go Back</button>
            </div>
            <div v-if="displayFTP">
              <button type="button" class="btn btn-primary" @click="document.location.reload(true);">Go Back</button>
            </div>
        </div>
        <hr>
        <div class="shadow" v-if="displayRecordFromQuery">
          <table id="myTable" class="tablefont" summary="The table has five columns and should be read per row. The first column indicate the document 
              symbol of the meeting record, which is linked to the actual document in PDF format. 
              The second column shows the date of the meeting, the third column is the symbol of the press release issued on the meeting. 
              The fourth column provides information on the subject of the meeting. And finally the fifth column gives details of the action 
              taken with links provided to the actual document in PDF format if a presidential statement has been issued or a resolution adopted.">
                  <tbody>
                      <tr>
                          <th class="tbltitle" colspan="5" v-model="actualYear">Meetings conducted by the Security Council in {{actualYear}} <br />
                          (in reverse chronological order)</th>
                      </tr>
                      <tr>
                          <th width="15%">Meeting<br />Record</th>
                          <th width="10%">Date</th>
                          <th width="30%">Topic</th>
                          <th width="15%">Security Council<br />
                          Outcome</th>
                          <th width="10%">Vote</th>
                          <th width="10%">Action(s)</th>
                      </tr>
                      <tr>
                          <td colspan="6"><strong>Document links</strong> will work once the document has been published in the Official Document System.</td>
                      </tr>
                      <tr  v-for="record in listOfRecords" >
                          
                          <td><a :href="'https://undocs.org/' + languageSelected.toLowerCase() + '/' + record.meeting_record"  target="top">{{record.meeting_record}}</a></td>
                          
                          <td>
                            <span v-if="languageSelected==='EN'"> {{record.date[0].value}}</span>
                            <span v-if="languageSelected==='FR'"> {{record.date[1].value}}</span>
                            <span v-if="languageSelected==='ES'"> {{record.date[2].value}}</span>
                            <span v-if="languageSelected==='RU'"> {{record.date[3].value}}</span>
                            <span v-if="languageSelected==='AR'"> {{record.date[4].value}}</span>
                            <span v-if="languageSelected==='ZH'"> {{record.date[5].value}}</span>
                          </td>
                          
                          <td>
                          <span v-if="languageSelected==='EN'"> {{record.topic[0].value}}</span>
                          <span v-if="languageSelected==='FR'"> {{record.topic[1].value}}</span>
                          <span v-if="languageSelected==='ES'"> {{record.topic[2].value}}</span>
                          <span v-if="languageSelected==='RU'"> {{record.topic[3].value}}</span>
                          <span v-if="languageSelected==='AR'"> {{record.topic[4].value}}</span>
                          <span v-if="languageSelected==='ZH'"> {{record.topic[5].value}}</span>
                          </td>
                           
                          <td> <span v-if="languageSelected==='EN' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[0].outcome_text}} </span>
                            <span v-if="languageSelected==='FR' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[1].outcome_text}} </span>                          
                            <span v-if="languageSelected==='ES' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[2].outcome_text}} </span>                          
                            <span v-if="languageSelected==='RU' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[3].outcome_text}}</span>
                            <span v-if="languageSelected==='AR' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[4].outcome_text}} </span>
                            <span v-if="languageSelected==='ZH' && record.outcomes.length>0 "> {{record.outcomes[0].outcome[5].outcome_text}} </span>
                            <span v-else>  </span>
                          </td>
                          
                          <td v-if="record.outcomes.length>0"> {{record.outcomes[0].outcome_vote}} </td>
                          <td v-else>  </td>

                          <td>
                          <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openUpdateRecord(record.meeting_record)">Update</span>                
                          </td>
                      </tr>
                  </tbody>
          </table>
        </div>

        <div v-if="displayFTP" class="form-section ">
          <h3> FTP parameters </h3>
          <hr>
              <p> <strong> Host ->      </strong> </p> 
              <p> <strong> Username ->  </strong> </p> 
              <p> <strong> Password ->  </strong> </p> 
              <p> <strong> Timeout ->  </strong> </p> 
              <p> <strong> Encoding ->  </strong> </p> 
          <hr>
          <div class="input-group mb-3">
            <label class="input-group-text" for="inputGroupFile01">Upload</label>
            <input type="file" class="form-control" id="inputGroupFile01">
          </div>
          <input type="submit" name="sendftp" class="btn btn-primary">
        </div>


        <div v-if="updateRecordFromQuery">
                <hr> 
                <form @submit.prevent="">
                <div class="mb-3">
                    <label for="inputMeeting" class="form-label">Meeting</label>
                    <input type="text" class="form-control" id="meeting" name="meeting" v-model="record">
                </div>   
                <div class="mb-3">
                    <label for="inputName" class="form-label">Date</label>
                    <input type="text" class="form-control" id="date" name="date" v-model="date">
                </div>   
                <div class="mb-3">
                    <label for="inputName" class="form-label">Topic</label>
                    <input type="text" class="form-control" id="topic" name="topic" v-model="topic">
                </div>   
                <div class="mb-3">
                    <label for="inputName" class="form-label">Security Council </label>
                    <input type="text" class="form-control" id="security_council_document" name="security_council_document" v-model="security_council_document">
                </div> 
                <div class="mb-3">
                    <label for="inputName" class="form-label">Outcome Vote</label>
                    <input type="text" class="form-control" id="vote" name="vote" v-model="vote">
                </div>     
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="refresh">
                  <label class="form-check-label" for="flexCheckDefault">
                    Allow Refresh
                  </label>
                </div>
                <hr>
                <button type="submit" class="btn btn-primary" @click="updateRecord()"> Update your record </button>
                <button class="btn btn-primary" @click="location.reload()">Back to previous windows</button>
                </form>
            </div>
        </div>
    </div>`,
    data: function () {
      return {
        initPage:true,
        displayFTP:false,
        meetingsIds:[],
        meetingSelected:"",
        languageSelected:"",
        displayRecordFromQuery:false,
        updateRecordFromQuery:false,
        prefix: this.prefix,
        actualYear:"",
        listOfRecords:[],
        listOfYearsAvailable:[],
        meeting_record:"",
        date:"",
        topic:"",
        security_council_document:"",
        vote:"",
        refresh:"",
        record:"",
        my_id:""
      }
    },
    
    created:async function(){
      // loading all the meetings ID
      const my_response = await fetch("/getlistingsId");
      const my_data = await my_response.json();
      my_data.forEach(element => {
        this.meetingsIds.push(element)
      });
      this.meetingsIds=this.meetingsIds.sort()

    },

    methods:{
      openFTP(){
        alert("define the ftp")
        this.initPage=false
        this.displayRecordFromQuery=false
        this.displayFTP=true
      },
      async displayData(listofmeetings,listoflanguages){
      // retrieve the parameters
      const myMeeting = document.getElementById(listofmeetings);
      const myMeetingValue = myMeeting.value;       
      const myLanguage = document.getElementById(listoflanguages);
      const myLanguageValue = myLanguage.value;  

      // assign the languages
      this.meetingSelected=myLanguageValue
      this.languageSelected=myLanguageValue

      // loading all the data
      const my_response = await fetch("/getlistings/" + myMeetingValue);
      const my_data = await my_response.json();
      console.log(my_data)
      my_data.forEach(element => {
        // We find the meeting
        if (element["listing_id"]===myMeetingValue){
            this.listOfRecords.push(element)
          }
        })
      this.initPage=false
      this.displayRecordFromQuery=true
      },

      openUpdateRecord(record){

        this.listOfRecords.forEach(element => {
          if (element.meeting_record==record) {

              this.my_id=element._id.$oid
              this.record=element.meeting_record

              // Management of the topic depending of the language
              if (this.languageSelected==='EN') {
                this.date=element.date[0].value
              }

              if (this.languageSelected==='FR') {
                this.date=element.date[1].value
              }

              if (this.languageSelected==='ES') {
                this.date=element.date[2].value
              }
              
              if (this.languageSelected==='RU') {
                this.date=element.date[3].value
              }

              if (this.languageSelected==='AR') {
                this.date=element.date[4].value
              }              

              if (this.languageSelected==='ZH') {
                this.date=element.date[5].value
              }    

              // Management of the topic depending of the language
              if (this.languageSelected==='EN') {
                  this.topic=element.topic[0].value
                }

              if (this.languageSelected==='FR') {
                this.topic=element.topic[1].value
              }

              if (this.languageSelected==='ES') {
                this.topic=element.topic[2].value
              }
              
              if (this.languageSelected==='RU') {
                this.topic=element.topic[3].value
              }

              if (this.languageSelected==='AR') {
                this.topic=element.topic[4].value
              }              

              if (this.languageSelected==='ZH') {
                this.topic=element.topic[5].value
              }    
              
              // Management of the outcome text dependiing of the language
              if (this.languageSelected==='EN') {
                this.security_council_document=element.outcomes[0].outcome[0].outcome_text
              }

            if (this.languageSelected==='FR') {
              this.security_council_document=element.outcomes[0].outcome[1].outcome_text
            }

            if (this.languageSelected==='ES') {
              this.security_council_document=element.outcomes[0].outcome[2].outcome_text
            }
            
            if (this.languageSelected==='RU') {
              this.security_council_document=element.outcomes[0].outcome[3].outcome_text
            }

            if (this.languageSelected==='AR') {
              this.security_council_document=element.outcomes[0].outcome[4].outcome_text
            }              

            if (this.languageSelected==='ZH') {
              this.security_council_document=element.outcomes[0].outcome[5].outcome_text
            }  

            this.refresh=element.refresh
            this.vote=element.outcomes[0].outcome_vote
 
          }
        });
      },
      async updateRecord(){
        let dataset = new FormData()
        dataset.append('_id',this.my_id)
        dataset.append('record',this.record)
        dataset.append('name',this.name)
        dataset.append('topic',this.topic)
        dataset.append('vote',this.vote)
        dataset.append('date',this.date)
        dataset.append('security_council_document',this.security_council_document)
        dataset.append('refresh',this.refresh)
        dataset.append('languageSelected',this.languageSelected)
        const my_response = await fetch("/update_listing",{
          "method":"PUT",
          "body":dataset
          });
        const my_data = await my_response.json();
        console.log(my_data)
        this.displayRecordFromQuery=true
        alert("Data updated!!!")
        location.reload()
      },
      displayUpdateRecordFromQuery(){
        this.displayRecordFromQuery=false
        this.updateRecordFromQuery=true
      },
      deleteRecord(docsymbol){
          
        if (confirm(`Do you really want to delete the record with the document symbol : ${docsymbol} ? `) == true) {
            this.listOfRecords=this.listOfRecords.filter((item)=>{
              return item.document_symbol!==docsymbol
          })
          }
        }, 
      async exportHTML(){
        try {
              
              let myData=document.getElementById("myTable")

              for(const row of myData.rows){
                  row.deleteCell(-1);
              }
              let myDataHTML=myData.outerHTML
              alert("Your data has been exported with HTML format!!!")
              let start=`
              <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>HTML 5 Boilerplate</title>
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>             
              `
              let end=`
                </body>
                </html>
              `
              let element = document.createElement('a');
              element.setAttribute('href', 'data:text/html;charset=utf-8,' + start + myDataHTML + end);
              element.setAttribute('download', `extract_security_counsel_table`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
        } catch (error) {
          alert(error.message)
        }
      },    
      exportExcel(tableName) {
        const uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function(s) {
          return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function(s, c) {
          return s.replace(/{(\w+)}/g, function(m, p) {
          return c[p];
          })
        }
        var toExcel = document.getElementById(tableName).innerHTML;
        var ctx = {
        worksheet: name || '',
        table: toExcel
        };
        var link = document.createElement("a");
        link.download = "export.xls";
        link.href = uri + base64(format(template, ctx))
        link.click();
      },
    },
    components: {}
  }
  )

let app_datasetssecuritycounsel = new Vue({
    el: '#dldatasetssecuritycounsel'
})

  
  
  