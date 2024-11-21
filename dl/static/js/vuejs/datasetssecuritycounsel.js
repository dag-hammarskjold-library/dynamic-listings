Vue.component('displaylistdatasetssecuritycounselcomponent',{
    props: ["title",'prefix'],
    template: `
     <div class="mt-3" id="test">
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
                <button type="button" class="btn btn-warning mt-2" @click="displayRecordFromQuery=false;createRecordFromQuery=true;initPage=false;AddOutcomeEmpty();"><i class="fas fa-plus"></i> Create a  new record</button> 
                <button type="button" class="btn btn-success mt-2" @click="displayData('listofmeetings','listoflanguages')"><i class="fas fa-pencil-alt"></i> Update the table</button> 
                <button type="button" class="btn btn-primary mt-2" @click="renderData('listofmeetings','listoflanguages')"><i class="fas fa-list-ul"></i> Display table</button> 
                <button type="button" class="btn btn-dark mt-2" @click="showMyModal()"><i class="fas fa-sync" ></i>  Refresh Tables</button> 
                <!--<button type="button" class="btn btn-warning mt-2" @click="openFTP()">Upload HTML file to the server</button>  -->
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
        <div class="shadow" v-if="displayRecordFromQuery" style="width:1200px;">
          <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='EN'" id="myTable"  class="tablefont table-condensed" summary="The table has five columns and should be read per row. The first column indicate the document 
              symbol of the meeting record, which is linked to the actual document in PDF format. 
              The second column shows the date of the meeting, the third column is the symbol of the press release issued on the meeting. 
              The fourth column provides information on the subject of the meeting. And finally the fifth column gives details of the action 
              taken with links provided to the actual document in PDF format if a presidential statement has been issued or a resolution adopted.">
                  <tbody>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th class="tbltitle" colspan="5" v-model="actualYear">Meetings conducted by the Security Council in {{actualYear}} <br />
                          (in reverse chronological order)</th>
                      </tr>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Meeting<br />Record</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Date</th>
                          <th width="30%" style="border: 1px solid black;border-collapse: collapse;">Topic</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Security Council / Vote </th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Actions</th>
                      </tr>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <td colspan="6"><strong>Document links</strong> will work once the document has been published in the Official Document System.</td>
                      </tr>
                      <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                          
                          <td style="border: 1px solid black;border-collapse: collapse;"><a :href="'https://undocs.org/' + languageSelected.toLowerCase() + '/' + record.meeting_record"  target="top">{{record.meeting_record}}</a></td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                            <span v-if="languageSelected==='EN'"> {{record.date[0].value}}</span>
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                          <span v-if="languageSelected==='EN'"> {{record.topic[0].value}}</span>
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;"> 
                            <span v-for="my_record in record.outcomes">
                              <span> {{my_record["outcome"][0]["outcome_text_prefix"]}} </span>
                              <span> <a :href="my_record['outcome'][0]['outcome_text_link']" target="_blamk"> {{my_record['outcome'][0]['outcome_text']}} </a> </span>
                              <span> {{my_record["outcome"][0]["outcome_text_sufix"]}} </span>
                              <br>
                              <span> {{my_record["outcome_vote"]}} </span>
                              <span v-else>  </span>
                              <br>
                            </span>
                          </td>


                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-pen"></i></span>  
                              <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-trash-alt"></i></span>               
                          </td>
                      </tr>
                  </tbody>
          </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='ES'" id="myTable" class="tablefont table-condensed" resumen="La tabla tiene cinco columnas y debe leerse por fila. La primera columna indica el documento símbolo del acta de la reunión, que está vinculado al documento real en formato PDF.La segunda columna muestra la fecha de la reunión, la tercera columna es el símbolo del comunicado de prensa emitido sobre la reunión.La cuarta columna proporciona información sobre el tema de la reunión. Y finalmente la quinta columna da detalles de la acción.tomado con enlaces proporcionados al documento real en formato PDF si se ha emitido una declaración presidencial o se ha adoptado una resolución.">
          <tbody>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <th class="tbltitle" colspan="5" v-model="actualYear"> Reuniones realizadas por el Consejo de Seguridad en {{actualYear}} <br />
                        (en orden cronológico inverso)</th>
                    </tr>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Reunión<br /></th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Fecha</th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="30%">Tema</th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Consejo de Seguridad / Votar</th>
                       
                        <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Acciones</th>
                    </tr>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <td colspan="6"><strong>Enlaces de documentos</strong> funcionará una vez que el documento haya sido publicado en el Sistema de Documento Oficial.</td>
                    </tr>
                    <tr  v-for="record in listOfRecords"  style="border: 1px solid black;border-collapse: collapse;">
                        
                        <td style="border: 1px solid black;border-collapse: collapse;"><a :href="'https://undocs.org/' + languageSelected.toLowerCase() + '/' + record.meeting_record"  target="top">{{record.meeting_record}}</a></td>
                        
                        <td style="border: 1px solid black;border-collapse: collapse;">
                          <span v-if="languageSelected==='EN'"> {{record.date[0].value}}</span>
                          <span v-if="languageSelected==='FR'"> {{record.date[1].value}}</span>
                          <span v-if="languageSelected==='ES'"> {{record.date[2].value}}</span>
                          <span v-if="languageSelected==='RU'"> {{record.date[3].value}}</span>
                          <span v-if="languageSelected==='AR'"> {{record.date[4].value}}</span>
                          <span v-if="languageSelected==='ZH'"> {{record.date[5].value}}</span>
                        </td>
                        
                        <td style="border: 1px solid black;border-collapse: collapse;">
                        <span v-if="languageSelected==='EN'"> {{record.topic[0].value}}</span>
                        <span v-if="languageSelected==='FR'"> {{record.topic[1].value}}</span>
                        <span v-if="languageSelected==='ES'"> {{record.topic[2].value}}</span>
                        <span v-if="languageSelected==='RU'"> {{record.topic[3].value}}</span>
                        <span v-if="languageSelected==='AR'"> {{record.topic[4].value}}</span>
                        <span v-if="languageSelected==='ZH'"> {{record.topic[5].value}}</span>
                        </td>
                        
                          <td style="border: 1px solid black;border-collapse: collapse;"> 
                            <span v-for="my_record in record.outcomes">
                              <span> {{my_record["outcome"][2]["outcome_text_prefix"]}} </span>
                              <span> <a :href="my_record['outcome'][2]['outcome_text_link']" target="_blamk"> {{my_record['outcome'][2]['outcome_text']}} </a> </span>
                              <span> {{my_record["outcome"][2]["outcome_text_sufix"]}} </span>
                              <br>
                              <span> {{my_record["outcome_vote"]}} </span>
                              <span v-else>  </span>
                              <br>
                            </span>
                          </td>

                        <td style="border: 1px solid black;border-collapse: collapse;">
                          
                            <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-pen"></i></span>  
                            <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-trash-alt"></i></span>               
                        </td>
                    </tr>
                </tbody>
        </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='FR'" id="myTable" class="tablefont table-condensed" resume="Le tableau comporte cinq colonnes et doit être lu par ligne. La première colonne indique le document symbole du compte rendu de la réunion, qui est lié au document lui-même au format PDF.La deuxième colonne indique la date de la réunion, la troisième colonne est le symbole du communiqué de presse publié sur la réunion.La quatrième colonne fournit des informations sur le sujet de la réunion. Et enfin la cinquième colonne détaille l'action pris avec des liens fournis vers le document lui-même au format PDF si une déclaration présidentielle a été publiée ou une résolution adoptée.">
          <tbody>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <th class="tbltitle" colspan="5" v-model="actualYear">Réunions conduites par le Conseil de sécurité en {{actualYear}} <br />
                  (Dans l'ordre chronologique inverse)</th>
              </tr>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Réunion<br /></th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Date</th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="30%">Sujet</th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Conseil de sécurité / Vote </th>
    
                  <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Actions</th>
              </tr>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <td colspan="6"><strong>Les liens vers les documents</strong> fonctionneront une fois que le document aura été publié dans le système de documents officiel.</td>
              </tr>
              <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                  
                  <td style="border: 1px solid black;border-collapse: collapse;"><a :href="'https://undocs.org/' + languageSelected.toLowerCase() + '/' + record.meeting_record"  target="top">{{record.meeting_record}}</a></td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;">
                    <span v-if="languageSelected==='EN'"> {{record.date[0].value}}</span>
                    <span v-if="languageSelected==='FR'"> {{record.date[1].value}}</span>
                    <span v-if="languageSelected==='ES'"> {{record.date[2].value}}</span>
                    <span v-if="languageSelected==='RU'"> {{record.date[3].value}}</span>
                    <span v-if="languageSelected==='AR'"> {{record.date[4].value}}</span>
                    <span v-if="languageSelected==='ZH'"> {{record.date[5].value}}</span>
                  </td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;">
                    <span v-if="languageSelected==='EN'"> {{record.topic[0].value}}</span>
                    <span v-if="languageSelected==='FR'"> {{record.topic[1].value}}</span>
                    <span v-if="languageSelected==='ES'"> {{record.topic[2].value}}</span>
                    <span v-if="languageSelected==='RU'"> {{record.topic[3].value}}</span>
                    <span v-if="languageSelected==='AR'"> {{record.topic[4].value}}</span>
                    <span v-if="languageSelected==='ZH'"> {{record.topic[5].value}}</span>
                  </td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;"> 
                    <span v-for="my_record in record.outcomes">
                      <span> {{my_record["outcome"][1]["outcome_text_prefix"]}} </span>
                      <span> <a :href="my_record['outcome'][1]['outcome_text_link']" target="_blamk"> {{my_record['outcome'][1]['outcome_text']}} </a> </span>
                      <span> {{my_record["outcome"][1]["outcome_text_sufix"]}} </span>
                      <br>
                      <span> {{my_record["outcome_vote"]}} </span>
                      <span v-else>  </span>
                      <br>
                    </span>
                  </td>

                  <td style="border: 1px solid black;border-collapse: collapse;">
                      
                      <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-pen"></i></span>  
                      <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record)"><i class="fas fa-trash-alt"></i></span>               
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
                <div class="mb-3">
                  <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This update will affect the record in English </h3>
                  <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> This update will affect the record in French </h3>
                  <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> This update will affect the record in Spanish </h3>
                  <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This update will affect the record in Russian</h3>
                  <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This update will affect the record in Arabic </h3>
                  <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This update will affect the record in Chinese</h3>
                </div> 
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

                    <div>
                      
                      <button class="btn btn-primary mb-2" @click="AddOutcomeEmpty()">Add Outcome</button>
                      
                      
                      <div v-if="languageSelected==='EN'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label">Vote</label>
                              <input class="form-control mt-2" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label">Language</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text link</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text prefix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text sufix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1" @click="removeRow(index)">Remove Outcome</button>
                        </div>  
                      </div>

                      
                      <div v-if="languageSelected==='FR'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label">Vote</label>
                              <input class="form-control mt-2" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label">Language</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[1]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[1]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text link</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[1]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text prefix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[1]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text sufix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[1]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1" @click="removeRow(index)">Remove Outcome</button>
                        </div>  
                      </div>

                      
                      <div v-if="languageSelected==='ES'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label">Vote</label>
                              <input class="form-control mt-2" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label">Language</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[2]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[2]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text link</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[2]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text prefix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[2]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text sufix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[2]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1" @click="removeRow(index)">Remove Outcome</button>
                        </div>  
                      </div>                      

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
        

        <div v-if="createRecordFromQuery">
              <div class="mb-3">
                <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This creation will affect the record in English </h3>
                <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> This creation will affect the record in French </h3>
                <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> This creation will affect the record in Spanish </h3>
                <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This creation will affect the record in Russian</h3>
                <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This creation will affect the record in Arabic </h3>
                <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This creation will affect the record in Chinese</h3>
              </div> 
              <hr> 
              <form @submit.prevent="">
              <div class="mb-3">
                  <label for="inputMeeting" class="form-label">Meeting</label>
                  <input type="text" class="form-control" id="meeting" name="record" v-model="record">
              </div>   
              <div class="mb-3">
                  <label for="inputMeetingLink" class="form-label">Record Link</label>
                  <input type="text" class="form-control" id="record_link" name="record_link" v-model="record_link">
              </div>  
              <div class="mb-3">
                  <label for="inputName" class="form-label">Date</label>
                  <input type="text" class="form-control" id="date" name="date" v-model="date">
              </div>   
              <div class="mb-3">
                  <label for="inputListingID" class="form-label">Listing id</label>
                  <input type="text" class="form-control" id="listing_id" name="listing_id" v-model="listing_id" >
              </div> 
              <div class="mb-3">
                  <label for="inputName" class="form-label">Topic</label>
                  <input type="text" class="form-control" id="topic" name="topic" v-model="topic">
              </div>   

              <!-- INJECTION DATA -->
              
              <div>
                      
                      <button class="btn btn-primary mb-2" @click="AddOutcomeEmpty()">Add Outcome</button>
                      
                      
                      
                      <div v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label">Vote</label>
                              <input class="form-control mt-2" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label">Language</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text link</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text prefix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label">Outcome text sufix</label>
                            <input class="form-control mt-2" v-model="outcome.outcome[0]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1" @click="removeRow(index)">Remove Outcome</button>
                        </div>  
                      </div>                                          
              </div> 
              <!-- END -->

              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="refresh">
                <label class="form-check-label" for="flexCheckDefault">
                  Allow Refresh
                </label>
              </div>
              <hr>
              <button type="submit" class="btn btn-primary" @click="createRecord()"> Create your record </button>
              <button class="btn btn-primary" @click="location.reload()">Back to previous windows</button>
              </form>
        </div>

        <div v-if="deleteRecordFromQuery">
            <div class="mb-3">
              <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This deletion will affect the record in English </h3>
              <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> This deletion will affect the record in French </h3>
              <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> This deletion will affect the record in Spanish </h3>
              <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This deletion will affect the record in Russian</h3>
              <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This deletion will affect the record in Arabic </h3>
              <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This deletion will affect the record in Chinese</h3>
            </div> 
            <hr> 
            <form @submit.prevent="">
            <div class="mb-3">
                <label for="inputMeeting" class="form-label">Meeting</label>
                <input type="text" class="form-control" id="meeting" name="meeting" v-model="record" disabled>
            </div>   
            <div class="mb-3">
                <label for="inputName" class="form-label">Date</label>
                <input type="text" class="form-control" id="date" name="date" v-model="date" disabled>
            </div>     
            <div class="mb-3">
                <label for="inputName" class="form-label">Topic</label>
                <input type="text" class="form-control" id="topic" name="topic" v-model="topic" disabled>
            </div>   
            <div class="mb-3">
                <label for="inputName" class="form-label">Outcome Text</label>
                <input type="text" class="form-control" id="security_council_document" name="security_council_document" v-model="security_council_document" disabled>
            </div>     
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="refresh" disabled>  
              <label class="form-check-label" for="flexCheckDefault">
                Allow Refresh
              </label>
            </div>
            <hr>
            <button type="submit" class="btn btn-primary" @click="deleteRecord()"> Delete your record </button>
            <button class="btn btn-primary" @click="location.reload()">Back to previous windows</button>
            </form>
        </div>

        <div :class="modalClasses" class="fade" id="reject" role="dialog">
            <div class="modal-dialog">
                  <div class="modal-content">
                        <div class="modal-header">
                          <h4 class="modal-title">Refreshing Data process</h4>
                          <button type="button" class="close" @click="showMyModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                        <label class="form-label"><strong>Please select the year</strong></label>
                          <select id="year" class="form-select mb-3" aria-label="Default select example">
                            <option value="2030">2030</option>
                            <option value="2029">2029</option>
                            <option value="2028">2028</option>
                            <option value="2027">2027</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                          </select>
                          <label class="form-label"><strong>Please select the month</strong></label>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="january" checked>
                              <label class="form-check-label" for="january">
                                January
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="february" >
                              <label class="form-check-label" for="february">
                                February
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="march" >
                              <label class="form-check-label" for="march">
                                March
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="april" >
                              <label class="form-check-label" for="april">
                                April
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="may" >
                              <label class="form-check-label" for="may">
                                May
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="june" >
                              <label class="form-check-label" for="june">
                                June
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="july" >
                              <label class="form-check-label" for="july">
                                July
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="august" >
                              <label class="form-check-label" for="august">
                                August
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="september" >
                              <label class="form-check-label" for="september">
                                September
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="october" >
                              <label class="form-check-label" for="october">
                                October
                              </label>
                            </div>
                             <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="november" >
                              <label class="form-check-label" for="november">
                                November
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="flexRadioDefault" id="december" >
                              <label class="form-check-label" for="december">
                                December
                              </label>
                            </div>  
                          <hr>
                          <button class="btn btn-primary" @click="refresh_data()">Refresh</button>
                        </div>
                    </div>
            </div>
        </div>
  
     </div>`,


    data: function () {
      return {
        outcomes:[],
        initPage:true,
        displayFTP:false,
        meetingsIds:[],
        meetingSelected:"",
        languageSelected:"",
        displayRecordFromQuery:false,
        updateRecordFromQuery:false,
        createRecordFromQuery:false,
        deleteRecordFromQuery:false,
        prefix: this.prefix,
        actualYear:"",
        listOfRecords:[],
        listOfYearsAvailable:[],
        meeting_record:"",
        date:"",
        topic:"",
        security_council_document:"",
        vote:"",
        refresh:Boolean,
        record:"",
        my_id:"",
        listing_id:"",
        record_link:"",
        modalClasses: ['modal','fade'],
      }
    },
    
    created:async function(){
      // loading all the meetings ID
      const my_response = await fetch("./getsclistingsId");
      const my_data = await my_response.json();
      my_data.forEach(element => {
        this.meetingsIds.push(element)
      });
      //this.meetingsIds=this.meetingsIds.sort()

    },

    methods:{
      addRow() {
        // Adds a new row with three empty cells
       this.AddOutcomeEmpty()
      },
      removeRow(index) {
        // Removes a row at the specified index
        this.outcomes.splice(index, 1);
      },
      openFTP(){
        alert("define the ftp")
        this.initPage=false
        this.displayRecordFromQuery=false
        this.displayFTP=true
      },
      AddOutcomeEmpty(){
        const myRecord=
        {
          outcome_vote:"0-0-0",
          outcome:[
            {
            lang:"EN",
            outcome_text:"",
            outcome_text_link:"",
            outcome_text_prefix:"",
            outcome_text_sufix:""
          },
          {
            lang:"FR",
            outcome_text:"",
            outcome_text_link:"",
            outcome_text_prefix:"",
            outcome_text_sufix:""
          },
          {
            lang:"ES",
            outcome_text:"",
            outcome_text_link:"",
            outcome_text_prefix:"",
            outcome_text_sufix:""
          }
        ]
        }
        this.outcomes.push(myRecord)
        console.log(this.outcomes)
      },
      showMyModal() {
        
        document.body.className += ' modal-open'
        let modalClasses = this.modalClasses
    
        if (modalClasses.indexOf('d-block') > -1) {
            modalClasses.pop()
            modalClasses.pop()
    
            //hide backdrop
            let backdrop = document.querySelector('.modal-backdrop')
            document.body.removeChild(backdrop)
        }
        else {
            modalClasses.push('d-block')
            modalClasses.push('show')
    
            //show backdrop
            let backdrop = document.createElement('div')
            backdrop.classList = "modal-backdrop fade show"
            document.body.appendChild(backdrop)
        }

        const date = new Date();
        const month = date.getMonth() + 1;
        const year=date.getFullYear()
       
        // checked the actual month
        if (month==1) document.getElementById("january").checked=true;
        if (month==2) document.getElementById("february").checked=true;
        if (month==3) document.getElementById("march").checked=true;
        if (month==4) document.getElementById("april").checked=true;
        if (month==5) document.getElementById("may").checked=true;
        if (month==6) document.getElementById("june").checked=true;
        if (month==7) document.getElementById("july").checked=true;
        if (month==8) document.getElementById("august").checked=true;
        if (month==9) document.getElementById("september").checked=true;
        if (month==10) document.getElementById("october").checked=true;
        if (month==11) document.getElementById("november").checked=true;
        if (month==12) document.getElementById("december").checked=true;

        // check the actual year
        if (year=="2020") document.getElementById("year").value="2020";
        if (year=="2021") document.getElementById("year").value="2021";
        if (year=="2022") document.getElementById("year").value="2022";
        if (year=="2023") document.getElementById("year").value="2023";
        if (year=="2024") document.getElementById("year").value="2024";
        if (year=="2025") document.getElementById("year").value="2025";
        if (year=="2026") document.getElementById("year").value="2026";
        if (year=="2027") document.getElementById("year").value="2027";
        if (year=="2028") document.getElementById("year").value="2028";
        if (year=="2029") document.getElementById("year").value="2029";
        if (year=="2030") document.getElementById("year").value="2030";

      },
      renderData(my_meeting,my_language){
       // getting values for the meeting and the language selected
       const my_meeting_value=document.getElementById(my_meeting).value
       const my_language_value=document.getElementById(my_language).value
       // getting the domain
        const my_location=window.location.toString()
        const my_string_to_replace="/datasetSecurityCounsel"
        const my_final_location=my_location.replace(my_string_to_replace,'')
        // generation of the url to open
        const url=`${my_final_location}/render_meeting/${my_meeting_value}/${my_language_value}`
        // open the url generated
        window.open(url, '_blank').focus();
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
      const my_response = await fetch("./getsclistings/" + myMeetingValue);
      const my_data = await my_response.json();
      
      my_data.forEach(element => {
        // We find the meeting
        if (element["listing_id"]===myMeetingValue){
            this.listOfRecords.push(element)
          }
        })
      this.initPage=false
      this.displayRecordFromQuery=true
      
      },

      openRecord(record){

        this.listOfRecords.forEach(element => {
          if (element.meeting_record==record) {

              this.my_id=element._id.$oid
              this.record=element.meeting_record
              this.listing_id=element.listing_id

              // Management of the date depending of the language
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
            
            this.outcomes=element.outcomes
 
          }
        });
      },
      async createRecord(){
        let dataset = new FormData()
        dataset.append('meeting_record',this.record)
        dataset.append('meeting_record_link',this.record_link)
        dataset.append('topic',this.topic)
        dataset.append('date',this.date)
        const my_outcomes=JSON.stringify(this.outcomes)
        dataset.append('outcomes',my_outcomes)
        dataset.append('refresh',this.refresh)
        dataset.append('listing_id',this.listing_id)
        dataset.append('languageSelected',"EN")
        const my_response = await fetch("./create_sc_listing",{
          "method":"POST",
          "body":dataset
          });
        const my_data = await my_response.json();
        this.displayRecordFromQuery=true
        alert("Record created!!!")
        location.reload()
      },
      async updateRecord(){
        
        let dataset = new FormData()
        dataset.append('_id',this.my_id)
        dataset.append('record',this.record)
        dataset.append('name',this.name)
        dataset.append('topic',this.topic)
        dataset.append('date',this.date)
        const my_outcomes=JSON.stringify(this.outcomes)
        dataset.append('outcomes',my_outcomes)
        dataset.append('refresh',this.refresh)
        dataset.append('languageSelected',this.languageSelected)
        const my_response = await fetch("./update_sc_listing",{
          "method":"PUT",
          "body":dataset
          });
        const my_data = await my_response.json();
        this.displayRecordFromQuery=true
        alert("Record updated!!!")
        location.reload()
      },
      displayUpdateRecordFromQuery(){
        
        this.displayRecordFromQuery=false
        this.updateRecordFromQuery=true
      },
      async deleteRecord(){
        if (confirm(`Do you really want to delete this record ? `) == true) {
          let dataset = new FormData()
          dataset.append('_id',this.my_id)
          const my_response = await fetch("./delete_sc_listing",{
            "method":"POST",
            "body":dataset
            });
          const my_data = await my_response.json();
          this.deleteRecordFromQuery=false
          alert("Record deleted!!!")
          location.reload()
        }
        },
      async refresh_data(){
        let myYear=document.getElementById("year").value
        let myMonth=""
        if (document.getElementById("january").checked) myMonth="01"
        if (document.getElementById("february").checked) myMonth="02"
        if (document.getElementById("march").checked) myMonth="03"
        if (document.getElementById("april").checked) myMonth="04"
        if (document.getElementById("may").checked) myMonth="05"
        if (document.getElementById("june").checked) myMonth="06"
        if (document.getElementById("july").checked) myMonth="07"
        if (document.getElementById("august").checked) myMonth="08"
        if (document.getElementById("september").checked) myMonth="09"
        if (document.getElementById("october").checked) myMonth="10"
        if (document.getElementById("november").checked) myMonth="11"
        if (document.getElementById("december").checked) myMonth="12"

        let dataset = new FormData()
        dataset.append('year',myYear)
        dataset.append('month',myMonth)
        alert("The process has started the data will be updated in few seconds!!!")
        const my_response = await fetch("./refresh_data",{
          "method":"POST",
          "body":dataset
          }); 
          const my_data = await my_response.json();  
        alert(my_data["message"])
        this.showMyModal()
      },
      async exportHTML(){
        try {
              
              let myData=document.getElementById("myTable")
              for(const row of myData.rows){
                  if (row.rowIndex!==0) 
                    {
                      row.deleteCell(-1);
                    }
              }
              let myDataHTML=myData.outerHTML
              alert("Your data has been exported with HTML format!!!")
              let start=`
              <div id="s-lg-content-74877231" class="  clearfix">
              <h4 style="text-align: center;">&nbsp;</h4>
              <link href="//www.un.org/depts/dhl/css/ga-table.css" rel="stylesheet" type="text/css">     
              <p style="text-align: justify;">&nbsp;</p>     
              `
              let end=`
              </div>
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

  
  
  