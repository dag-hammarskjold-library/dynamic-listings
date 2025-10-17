Vue.component('displaylistdatasetssecuritycounselcomponent',{
    props: ["title",'prefix'],
    template: `
     <div class="container" id="test" style="min-height: 60vh;">
        <div class="alert alert-success" role="alert">
            <h3 class="alert-heading"> Dynamic Listings - {{title}} </h3>
        </div>
        
        <div class="container-fluid">
            <div v-if="initPage==true">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="browser" class="form-label">
                    Choose your meeting from the list:
                  </label>
                  <select class="form-select" aria-label="Default select example" name="listofmeetings" id="listofmeetings">
                    <option v-for="meeting in meetingsIds" v-bind:value="meeting">{{meeting}}</option>
                  </select> 
                </div>
                
                <div class="col-md-6">
                  <label for="listoflanguages" class="form-label">
                    Choose your language from the list:
                  </label>
                  <select class="form-select" aria-label="Default select example" name="listoflanguages" id="listoflanguages">
                    <option value="FR">🇫🇷 French</option>
                    <option value="EN" selected="selected">🇺🇸 English</option>
                    <option value="ES">🇪🇸 Spanish</option>
                  </select>
                </div>
              </div>
              
              <div class="row mt-4">
                <div class="col">
                  <button type="button" class="btn btn-success me-2" @click="displayRecordFromQuery=false;createRecordFromQuery=true;initPage=false;AddOutcomeEmpty();">
                    Create new record
                  </button>
                  <button type="button" class="btn btn-primary me-2" @click="displayData('listofmeetings','listoflanguages')">
                    Update the table
                  </button>
                  <button type="button" class="btn btn-secondary me-2" @click="renderData('listofmeetings','listoflanguages')">
                    Display
                  </button> 
                  <button type="button" class="btn btn-warning me-2" @click="showMyModal()">
                    Refresh
                  </button>
                  <button type="button" class="btn btn-info me-2" @click="renderDataJSON('listofmeetings','listoflanguages')">
                    Display Partial JSON
                  </button> 
                  <button type="button" class="btn btn-secondary me-2" @click="exportDataToJson('listofmeetings','listoflanguages')">
                    Full JSON
                  </button> 
                </div>
              </div>
            </div>
            <div v-if="displayRecordFromQuery">
              <div class="row mt-3">
                <div class="col">
                  <button type="button" class="btn btn-success me-2" @click="exportExcel('myTable')">
                    Extract to Excel
                  </button>
                  <button type="button" class="btn btn-secondary me-2" @click="exportHTML()">
                    Extract to HTML
                  </button>
                  <button type="button" class="btn btn-primary me-2" @click="document.location.reload(true);">
                    Go Back
                  </button>
                </div>
              </div>
            </div>
            <div v-if="displayFTP">
              <div class="row mt-3">
                <div class="col">
                  <button type="button" class="btn btn-primary" @click="document.location.reload(true);">
                    Go Back
                  </button>
                </div>
              </div>
            </div>
        </div>
        <div v-if="displayRecordFromQuery" class="mt-4">
          <table v-if="languageSelected==='EN'" id="myTable" class="table table-striped liquid-table" summary="The table has five columns and should be read per row. The first column indicate the document 
              symbol of the meeting record, which is linked to the actual document in PDF format. 
              The second column shows the date of the meeting, the third column is the symbol of the press release issued on the meeting. 
              The fourth column provides information on the subject of the meeting. And finally the fifth column gives details of the action 
              taken with links provided to the actual document in PDF format if a presidential statement has been issued or a resolution adopted.">
                  <tbody>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th class="tbltitle" colspan="6" v-model="actualYear">Meetings conducted by the Security Council in {{actualYear}} <br />
                          (in reverse chronological order)</th>
                      </tr>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Meeting<br />Record</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Date</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Press Release</th>
                          <th width="30%" style="border: 1px solid black;border-collapse: collapse;">Topic</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Security Council / Vote </th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Actions</th>
                      </tr>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <td colspan="6"><strong>Document links</strong> will work once the document has been published in the Official Document System.</td>
                      </tr>
                      <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                         
                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <a :href="record.meeting_record_link || '#'"  target="_blank">{{record.meeting_record_en || ''}}</a>
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                            <span v-if="languageSelected==='EN'"> {{record.date && record.date[0] ? record.date[0].value : ''}}</span>
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                            <span v-if="languageSelected==='EN'"><a :href="record.press_release_link_en || '#'"  target="_blank">{{record.press_release_text_prefix_en || ''}} {{record.press_release_text_en || ''}} {{record.press_release_text_sufix_en || ''}}</a></span>
                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                          <span v-if="languageSelected==='EN'"> {{record.topic && record.topic[0] ? record.topic[0].value : ''}}</span>
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;"> 
                            <span v-for="my_record in (record.outcomes || [])">
                              <span> {{my_record["outcome"] && my_record["outcome"][0] ? my_record["outcome"][0]["outcome_text_prefix"] : ''}} </span>
                              <span> <a :href="my_record['outcome'] && my_record['outcome'][0] ? my_record['outcome'][0]['outcome_text_link'] : '#'" target="_blank"> {{my_record['outcome'] && my_record['outcome'][0] ? my_record['outcome'][0]['outcome_text'] : ''}} </a> </span>
                              <span> {{my_record["outcome"] && my_record["outcome"][0] ? my_record["outcome"][0]["outcome_text_sufix"] : ''}} </span>
                              <br>
                              <span> {{my_record["outcome_vote"] || ''}} </span>
                              <span v-else>  </span>
                              <br>
                            </span>
                          </td>


                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-pen"></i></span>  
                              <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-trash-alt"></i></span>               
                          </td>
                      </tr>
                  </tbody>
          </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='ES'" id="myTable" class="tablefont table-condensed liquid-table" resumen="La tabla tiene cinco columnas y debe leerse por fila. La primera columna indica el documento símbolo del acta de la reunión, que está vinculado al documento real en formato PDF.La segunda columna muestra la fecha de la reunión, la tercera columna es el símbolo del comunicado de prensa emitido sobre la reunión.La cuarta columna proporciona información sobre el tema de la reunión. Y finalmente la quinta columna da detalles de la acción.tomado con enlaces proporcionados al documento real en formato PDF si se ha emitido una declaración presidencial o se ha adoptado una resolución.">
          <tbody>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <th class="tbltitle" colspan="6" v-model="actualYear"> Reuniones realizadas por el Consejo de Seguridad en {{actualYear}} <br />
                        (en orden cronológico inverso)</th>
                    </tr>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Reunión<br /></th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Fecha</th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Comunicado de prensa</th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="30%">Tema</th>
                        <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Consejo de Seguridad / Votar</th>
                       
                        <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Acciones</th>
                    </tr>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                        <td colspan="6"><strong>Enlaces de documentos</strong> funcionará una vez que el documento haya sido publicado en el Sistema de Documento Oficial.</td>
                    </tr>
                    <tr  v-for="record in listOfRecords"  style="border: 1px solid black;border-collapse: collapse;">
                        
                        <td style="border: 1px solid black;border-collapse: collapse;"><a :href="record.meeting_record_link_es || '#'"  target="_blank">{{record.meeting_record_es || ''}}</a></td>
                        
                        <td style="border: 1px solid black;border-collapse: collapse;">
                          <span v-if="languageSelected==='EN'"> {{record.date && record.date[0] ? record.date[0].value : ''}}</span>
                          <span v-if="languageSelected==='FR'"> {{record.date && record.date[1] ? record.date[1].value : ''}}</span>
                          <span v-if="languageSelected==='ES'"> {{record.date && record.date[2] ? record.date[2].value : ''}}</span>
                          <span v-if="languageSelected==='RU'"> {{record.date && record.date[3] ? record.date[3].value : ''}}</span>
                          <span v-if="languageSelected==='AR'"> {{record.date && record.date[4] ? record.date[4].value : ''}}</span>
                          <span v-if="languageSelected==='ZH'"> {{record.date && record.date[5] ? record.date[5].value : ''}}</span>
                        </td>
                        
                        <td style="border: 1px solid black;border-collapse: collapse;">
                          <span v-if="languageSelected==='EN'"><a :href="record.press_release_link_en || '#'"  target="_blank">{{record.press_release_text_prefix_en || ''}} {{record.press_release_text_en || ''}} {{record.press_release_text_sufix_en || ''}}</a></span>
                          <span v-if="languageSelected==='FR'"><a :href="record.press_release_link_fr || '#'"  target="_blank">{{record.press_release_text_prefix_fr || ''}} {{record.press_release_text_fr || ''}} {{record.press_release_text_sufix_fr || ''}}</a></span>
                          <span v-if="languageSelected==='ES'"><a :href="record.press_release_link_es || '#'"  target="_blank">{{record.press_release_text_prefix_es || ''}} {{record.press_release_text_es || ''}} {{record.press_release_text_sufix_es || ''}}</a></span>
                          <span v-if="languageSelected==='RU'"><a :href="record.press_release_link_ru || '#'"  target="_blank">{{record.press_release_text_prefix_ru || ''}} {{record.press_release_text_ru || ''}} {{record.press_release_text_sufix_ru || ''}}</a></span>
                          <span v-if="languageSelected==='AR'"><a :href="record.press_release_link_ar || '#'"  target="_blank">{{record.press_release_text_prefix_ar || ''}} {{record.press_release_text_ar || ''}} {{record.press_release_text_sufix_ar || ''}}</a></span>
                          <span v-if="languageSelected==='ZH'"><a :href="record.press_release_link_zh || '#'"  target="_blank">{{record.press_release_text_prefix_zh || ''}} {{record.press_release_text_zh || ''}} {{record.press_release_text_sufix_zh || ''}}</a></span>
                        </td>
                        
                        <td style="border: 1px solid black;border-collapse: collapse;">
                        <span v-if="languageSelected==='EN'"> {{record.topic && record.topic[0] ? record.topic[0].value : ''}}</span>
                        <span v-if="languageSelected==='FR'"> {{record.topic && record.topic[1] ? record.topic[1].value : ''}}</span>
                        <span v-if="languageSelected==='ES'"> {{record.topic && record.topic[2] ? record.topic[2].value : ''}}</span>
                        <span v-if="languageSelected==='RU'"> {{record.topic && record.topic[3] ? record.topic[3].value : ''}}</span>
                        <span v-if="languageSelected==='AR'"> {{record.topic && record.topic[4] ? record.topic[4].value : ''}}</span>
                        <span v-if="languageSelected==='ZH'"> {{record.topic && record.topic[5] ? record.topic[5].value : ''}}</span>
                        </td>
                        
                          <td style="border: 1px solid black;border-collapse: collapse;"> 
                            <span v-for="my_record in (record.outcomes || [])">
                              <span> {{my_record["outcome"] && my_record["outcome"][2] ? my_record["outcome"][2]["outcome_text_prefix"] : ''}} </span>
                              <span> <a :href="my_record['outcome'] && my_record['outcome'][2] ? my_record['outcome'][2]['outcome_text_link'] : '#'" target="_blank"> {{my_record['outcome'] && my_record['outcome'][2] ? my_record['outcome'][2]['outcome_text'] : ''}} </a> </span>
                              <span> {{my_record["outcome"] && my_record["outcome"][2] ? my_record["outcome"][2]["outcome_text_sufix"] : ''}} </span>
                              <br>
                              <span> {{my_record["outcome_vote"] || ''}} </span>
                              <span v-else>  </span>
                              <br>
                            </span>
                          </td>

                        <td style="border: 1px solid black;border-collapse: collapse;">
                          
                            <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-pen"></i></span>  
                            <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-trash-alt"></i></span>               
                        </td>
                    </tr>
                </tbody>
        </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='FR'" id="myTable" class="tablefont table-condensed liquid-table" resume="Le tableau comporte cinq colonnes et doit être lu par ligne. La première colonne indique le document symbole du compte rendu de la réunion, qui est lié au document lui-même au format PDF.La deuxième colonne indique la date de la réunion, la troisième colonne est le symbole du communiqué de presse publié sur la réunion.La quatrième colonne fournit des informations sur le sujet de la réunion. Et enfin la cinquième colonne détaille l'action pris avec des liens fournis vers le document lui-même au format PDF si une déclaration présidentielle a été publiée ou une résolution adoptée.">
          <tbody>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <th class="tbltitle" colspan="6" v-model="actualYear">Réunions conduites par le Conseil de sécurité en {{actualYear}} <br />
                  (Dans l'ordre chronologique inverse)</th>
              </tr>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Réunion<br /></th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Date</th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Communiqué de presse</th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="30%">Sujet</th>
                  <th style="border: 1px solid black;border-collapse: collapse;" width="15%">Conseil de sécurité / Vote </th>
    
                  <th style="border: 1px solid black;border-collapse: collapse;" width="10%">Actions</th>
              </tr>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <td colspan="6"><strong>Les liens vers les documents</strong> fonctionneront une fois que le document aura été publié dans le système de documents officiel.</td>
              </tr>
              <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                  
                  <td style="border: 1px solid black;border-collapse: collapse;"><a :href="record.meeting_record_link_fr || '#'"  target="_blank">{{record.meeting_record_fr || ''}}</a></td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;">
                    <span v-if="languageSelected==='EN'"> {{record.date && record.date[0] ? record.date[0].value : ''}}</span>
                    <span v-if="languageSelected==='FR'"> {{record.date && record.date[1] ? record.date[1].value : ''}}</span>
                    <span v-if="languageSelected==='ES'"> {{record.date && record.date[2] ? record.date[2].value : ''}}</span>
                    <span v-if="languageSelected==='RU'"> {{record.date && record.date[3] ? record.date[3].value : ''}}</span>
                    <span v-if="languageSelected==='AR'"> {{record.date && record.date[4] ? record.date[4].value : ''}}</span>
                    <span v-if="languageSelected==='ZH'"> {{record.date && record.date[5] ? record.date[5].value : ''}}</span>
                  </td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;">
                    <span v-if="languageSelected==='EN'"><a :href="record.press_release_link_en || '#'"  target="_blank">{{record.press_release_text_prefix_en || ''}} {{record.press_release_text_en || ''}} {{record.press_release_text_sufix_en || ''}}</a></span>
                    <span v-if="languageSelected==='FR'"><a :href="record.press_release_link_fr || '#'"  target="_blank">{{record.press_release_text_prefix_fr || ''}} {{record.press_release_text_fr || ''}} {{record.press_release_text_sufix_fr || ''}}</a></span>
                    <span v-if="languageSelected==='ES'"><a :href="record.press_release_link_es || '#'"  target="_blank">{{record.press_release_text_prefix_es || ''}} {{record.press_release_text_es || ''}} {{record.press_release_text_sufix_es || ''}}</a></span>
                    <span v-if="languageSelected==='RU'"><a :href="record.press_release_link_ru || '#'"  target="_blank">{{record.press_release_text_prefix_ru || ''}} {{record.press_release_text_ru || ''}} {{record.press_release_text_sufix_ru || ''}}</a></span>
                    <span v-if="languageSelected==='AR'"><a :href="record.press_release_link_ar || '#'"  target="_blank">{{record.press_release_text_prefix_ar || ''}} {{record.press_release_text_ar || ''}} {{record.press_release_text_sufix_ar || ''}}</a></span>
                    <span v-if="languageSelected==='ZH'"><a :href="record.press_release_link_zh || '#'"  target="_blank">{{record.press_release_text_prefix_zh || ''}} {{record.press_release_text_zh || ''}} {{record.press_release_text_sufix_zh || ''}}</a></span>
                  </td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;">
                    <span v-if="languageSelected==='EN'"> {{record.topic && record.topic[0] ? record.topic[0].value : ''}}</span>
                    <span v-if="languageSelected==='FR'"> {{record.topic && record.topic[1] ? record.topic[1].value : ''}}</span>
                    <span v-if="languageSelected==='ES'"> {{record.topic && record.topic[2] ? record.topic[2].value : ''}}</span>
                    <span v-if="languageSelected==='RU'"> {{record.topic && record.topic[3] ? record.topic[3].value : ''}}</span>
                    <span v-if="languageSelected==='AR'"> {{record.topic && record.topic[4] ? record.topic[4].value : ''}}</span>
                    <span v-if="languageSelected==='ZH'"> {{record.topic && record.topic[5] ? record.topic[5].value : ''}}</span>
                  </td>
                  
                  <td style="border: 1px solid black;border-collapse: collapse;"> 
                    <span v-for="my_record in (record.outcomes || [])">
                      <span> {{my_record["outcome"] && my_record["outcome"][1] ? my_record["outcome"][1]["outcome_text_prefix"] : ''}} </span>
                      <span> <a :href="my_record['outcome'] && my_record['outcome'][1] ? my_record['outcome'][1]['outcome_text_link'] : '#'" target="_blank"> {{my_record['outcome'] && my_record['outcome'][1] ? my_record['outcome'][1]['outcome_text'] : ''}} </a> </span>
                      <span> {{my_record["outcome"] && my_record["outcome"][1] ? my_record["outcome"][1]["outcome_text_sufix"] : ''}} </span>
                      <br>
                      <span> {{my_record["outcome_vote"] || ''}} </span>
                      <span v-else>  </span>
                      <br>
                    </span>
                  </td>

                  <td style="border: 1px solid black;border-collapse: collapse;">
                      
                      <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-pen"></i></span>  
                      <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.meeting_record || '')"><i class="fas fa-trash-alt"></i></span>               
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

        <div v-if="updateRecordFromQuery" style="overflow: visible;">
                <div class="mb-3">
                  <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This update will affect the record in English </h3>
                  <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> This update will affect the record in French </h3>
                  <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> This update will affect the record in Spanish </h3>
                  <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This update will affect the record in Russian</h3>
                  <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This update will affect the record in Arabic </h3>
                  <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This update will affect the record in Chinese</h3>
                </div>
                <hr>
                <form @submit.prevent="" class="liquid-form">
                    <div v-if="languageSelected==='EN'" class="mb-3">
                        <label for="inputMeeting" class="form-label">Meeting</label>
                        <input type="text" class="form-control" id="meeting_recorden" name="meeting_recorden" v-model="meeting_recorden">
                    </div>   
                    
                    <div v-if="languageSelected==='FR'" class="mb-3">
                        <label for="inputMeeting" class="form-label">Meeting</label>
                        <input type="text" class="form-control" id="meeting_recordfr" name="meeting_recordfr" v-model="meeting_recordfr">
                    </div>
                    
                    <div v-if="languageSelected==='ES'" class="mb-3">
                        <label for="inputMeeting" class="form-label">Meeting</label>
                        <input type="text" class="form-control" id="meeting_recordes" name="meeting_recordes" v-model="meeting_recordes">
                    </div>

                    <div v-if="languageSelected==='EN'" class="mb-3">
                        <label for="inputMeetingLinkEN" class="form-label">Meeting Link</label>
                        <input type="text" class="form-control" id="meetinglinken" name="meetinglinken" v-model="meetinglinken">
                    </div> 
                    
                    <div v-if="languageSelected==='FR'" class="mb-3">
                        <label for="inputMeetingLinkFR" class="form-label">Meeting Link</label>
                        <input type="text" class="form-control" id="meetinglinkfr" name="meetinglinkfr" v-model="meetinglinkfr">
                    </div> 
                    
                    <div v-if="languageSelected==='ES'" class="mb-3">
                        <label for="inputMeetingLinkES" class="form-label">Meeting Link</label>
                        <input type="text" class="form-control" id="meetinglinkes" name="meetinglinkes" v-model="meetinglinkes">
                    </div> 



                    <div class="mb-3">
                        <label for="inputName" class="form-label">Date</label>
                        <input type="text" class="form-control" id="date" name="date" v-model="date">
                    </div>   

                    <div v-if="languageSelected==='EN'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Link</label>
                        <input type="text" class="form-control" id="press_release_link_en" name="press_release_link_en" v-model="press_release_link_en">
                    </div>  

                    <div v-if="languageSelected==='EN'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Text</label>
                        <input type="text" class="form-control" id="press_release_text_en" name="press_release_text_en" v-model="press_release_text_en">
                    </div> 
                    
                    <div v-if="languageSelected==='EN'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Prefix</label>
                        <input type="text" class="form-control" id="press_release_text_prefix_en" name="press_release_text_prefix_en" v-model="press_release_text_prefix_en">
                    </div> 
                    
                    <div v-if="languageSelected==='EN'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Sufix</label>
                        <input type="text" class="form-control" id="press_release_text_sufix_en" name="press_release_text_sufix_en" v-model="press_release_text_sufix_en">
                    </div> 

                    <div v-if="languageSelected==='ES'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Link</label>
                        <input type="text" class="form-control" id="press_release_link_es" name="press_release_link_es" v-model="press_release_link_es">
                    </div>  

                    <div v-if="languageSelected==='ES'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Text</label>
                        <input type="text" class="form-control" id="press_release_text_es" name="press_release_text_es" v-model="press_release_text_es">
                    </div> 
                    
                    <div v-if="languageSelected==='ES'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Prefix</label>
                        <input type="text" class="form-control" id="press_release_text_prefix_es" name="press_release_text_prefix_es" v-model="press_release_text_prefix_es">
                    </div> 
                    
                    <div v-if="languageSelected==='ES'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Sufix</label>
                        <input type="text" class="form-control" id="press_release_text_sufix_es" name="press_release_text_sufix_es" v-model="press_release_text_sufix_es">
                    </div> 
                    
                    <div v-if="languageSelected==='FR'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Link</label>
                        <input type="text" class="form-control" id="press_release_link_fr" name="press_release_link_fr" v-model="press_release_link_fr">
                    </div>  

                    <div v-if="languageSelected==='FR'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Text</label>
                        <input type="text" class="form-control" id="press_release_text_fr" name="press_release_text_fr" v-model="press_release_text_fr">
                    </div> 
                    
                    <div v-if="languageSelected==='FR'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Prefix</label>
                        <input type="text" class="form-control" id="press_release_text_prefix_fr" name="press_release_text_prefix_fr" v-model="press_release_text_prefix_fr">
                    </div> 
                    
                    <div v-if="languageSelected==='FR'"class="mb-3">
                        <label for="inputName" class="form-label">Press Release Sufix</label>
                        <input type="text" class="form-control" id="press_release_text_sufix_fr" name="press_release_text_sufix_fr" v-model="press_release_text_sufix_fr">
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
                              <label for="outcomevote" class="form-label outcome-label">Vote</label>
                              <input class="form-control mt-2 outcome-input" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label outcome-label">Language</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text link</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text prefix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text sufix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1 outcome-button" @click="removeRow(index)" :disabled="outcomes.length <= 1">Remove Outcome</button>
                        </div>  
                      </div>

                      
                      <div v-if="languageSelected==='FR'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label outcome-label">Vote</label>
                              <input class="form-control mt-2 outcome-input" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label outcome-label">Language</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[1]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[1]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text link</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[1]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text prefix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[1]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text sufix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[1]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1 outcome-button" @click="removeRow(index)" :disabled="outcomes.length <= 1">Remove Outcome</button>
                        </div>  
                      </div>

                      
                      <div v-if="languageSelected==='ES'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                        <div class="cell card bg-light">
                        
                          <div class="mb-1">
                              <label for="outcomevote" class="form-label outcome-label">Vote</label>
                              <input class="form-control mt-2 outcome-input" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label outcome-label">Language</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[2]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[2]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text link</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[2]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text prefix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[2]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text sufix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[2]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1 outcome-button" @click="removeRow(index)" :disabled="outcomes.length <= 1">Remove Outcome</button>
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
                    <button type="submit" class="btn btn-primary liquid-btn" @click="updateRecord()"> Update your record </button>
                    <button class="btn btn-primary liquid-btn" @click="location.reload()">Back to previous windows</button>
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
              <div v-if="languageSelected==='EN'" class="mb-3">
                  <label for="inputMeeting" class="form-label">Meeting</label>
                  <input type="text" class="form-control" id="meeting_recorden" name="meeting_recorden" v-model="meeting_recorden">
              </div>   
              
              <div v-if="languageSelected==='FR'" class="mb-3">
                  <label for="inputMeeting" class="form-label">Meeting</label>
                  <input type="text" class="form-control" id="meeting_recordfr" name="meeting_recordfr" v-model="meeting_recordfr">
              </div>
              
              <div v-if="languageSelected==='ES'" class="mb-3">
                  <label for="inputMeeting" class="form-label">Meeting</label>
                  <input type="text" class="form-control" id="meeting_recordes" name="meeting_recordes" v-model="meeting_recordes">
              </div>


              <div v-if="languageSelected==='EN'" class="mb-3">
                  <label for="inputMeetingLinkEN" class="form-label">Meeting Link</label>
                  <input type="text" class="form-control" id="meetinglinken" name="meetinglinken" v-model="meetinglinken">
              </div> 
              
              <div v-if="languageSelected==='FR'" class="mb-3">
                  <label for="inputMeetingLinkFR" class="form-label">Meeting Link</label>
                  <input type="text" class="form-control" id="meetinglinkfr" name="meetinglinkfr" v-model="meetinglinkfr">
              </div> 
              
              <div v-if="languageSelected==='ES'" class="mb-3">
                  <label for="inputMeetingLinkES" class="form-label">Meeting Link</label>
                  <input type="text" class="form-control" id="meetinglinkes" name="meetinglinkes" v-model="meetinglinkes">
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
                              <label for="outcomevote" class="form-label outcome-label">Vote</label>
                              <input class="form-control mt-2 outcome-input" v-model="outcome.outcome_vote"/><br>
                          </div>

                          <div class="mb-1">
                            <label for="lang" class="form-label outcome-label">Language</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['lang']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text link</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_link']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text prefix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_prefix']"/><br>
                          </div>
                          <div class="mb-1">
                            <label for="outcometext" class="form-label outcome-label">Outcome text sufix</label>
                            <input class="form-control mt-2 outcome-input" v-model="outcome.outcome[0]['outcome_text_sufix']"/><br>
                          </div>
                          <button class="btn btn-primary ml-1 mb-1 mt-1 outcome-button" @click="removeRow(index)" :disabled="outcomes.length <= 1">Remove Outcome</button>
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

        <div v-if="deleteRecordFromQuery" style="overflow: visible;">
            <div class="mb-3">
              <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This deletion will affect the record in English </h3>
              <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> This deletion will affect the record in French </h3>
              <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> This deletion will affect the record in Spanish </h3>
              <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This deletion will affect the record in Russian</h3>
              <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This deletion will affect the record in Arabic </h3>
              <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This deletion will affect the record in Chinese</h3>
            </div>
            <hr>
            <form @submit.prevent="" class="liquid-form">
            <div v-if="languageSelected==='EN'" class="mb-3">
                <label for="inputMeeting" class="form-label">Meeting</label>
                <input type="text" class="form-control" id="meeting_recorden" name="meeting_recorden" v-model="meeting_recorden" disabled>
            </div>
            <div v-if="languageSelected==='FR'" class="mb-3">
                <label for="inputMeeting" class="form-label">Meeting</label>
                <input type="text" class="form-control" id="meeting_recordfr" name="meeting_recordfr" v-model="meeting_recordfr" disabled>
            </div>   
            <div v-if="languageSelected==='ES'" class="mb-3">
                <label for="inputMeeting" class="form-label">Meeting</label>
                <input type="text" class="form-control" id="meeting_recordes" name="meeting_recordes" v-model="meeting_recordes" disabled>
            </div>   
            <div class="mb-3">
                <label for="inputName" class="form-label">Date</label>
                <input type="text" class="form-control" id="date" name="date" v-model="date" disabled>
            </div>  

            <div v-if="languageSelected==='EN'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Link</label>
                <input type="text" class="form-control" id="press_release_link_en" name="press_release_link_en" v-model="press_release_link_en" disabled>
            </div>  

            <div v-if="languageSelected==='EN'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Text</label>
                <input type="text" class="form-control" id="press_release_text_en" name="press_release_text_en" v-model="press_release_text_en" disabled>
            </div> 
            
            <div v-if="languageSelected==='EN'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Prefix</label>
                <input type="text" class="form-control" id="press_release_text_prefix_en" name="press_release_text_prefix_en" v-model="press_release_text_prefix_en" disabled>
            </div> 
            
            <div v-if="languageSelected==='EN'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Sufix</label>
                <input type="text" class="form-control" id="press_release_text_sufix_en" name="press_release_text_sufix_en" v-model="press_release_text_sufix_en" disabled>
            </div> 

            <div v-if="languageSelected==='ES'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Link</label>
                <input type="text" class="form-control" id="press_release_link_es" name="press_release_link_es" v-model="press_release_link_es" disabled>
            </div>  

            <div v-if="languageSelected==='ES'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Text</label>
                <input type="text" class="form-control" id="press_release_text_es" name="press_release_text_es" v-model="press_release_text_es" disabled>
            </div> 
            
            <div v-if="languageSelected==='ES'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Prefix</label>
                <input type="text" class="form-control" id="press_release_text_prefix_es" name="press_release_text_prefix_es" v-model="press_release_text_prefix_es" disabled>
            </div> 
            
            <div v-if="languageSelected==='ES'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Sufix</label>
                <input type="text" class="form-control" id="press_release_text_sufix_es" name="press_release_text_sufix_es" v-model="press_release_text_sufix_es" disabled>
            </div> 
            
            <div v-if="languageSelected==='FR'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Link</label>
                <input type="text" class="form-control" id="press_release_link_fr" name="press_release_link_fr" v-model="press_release_link_fr" disabled>
            </div>  

            <div v-if="languageSelected==='FR'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Text</label>
                <input type="text" class="form-control" id="press_release_text_fr" name="press_release_text_fr" v-model="press_release_text_fr" disabled>
            </div> 
            
            <div v-if="languageSelected==='FR'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Prefix</label>
                <input type="text" class="form-control" id="press_release_text_prefix_fr" name="press_release_text_prefix_fr" v-model="press_release_text_prefix_fr" disabled>
            </div> 
            
            <div v-if="languageSelected==='FR'"class="mb-3">
                <label for="inputName" class="form-label">Press Release Sufix</label>
                <input type="text" class="form-control" id="press_release_text_sufix_fr" name="press_release_text_sufix_fr" v-model="press_release_text_sufix_fr" disabled>
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
            <button type="submit" class="btn btn-primary liquid-btn" @click="showDeleteConfirmation()"> Delete your record </button>
            <button class="btn btn-primary liquid-btn" @click="location.reload()">Back to previous windows</button>
            </form>
        </div>

        <div class="modal" id="reject" role="dialog" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1055; background: rgba(0,0,0,0.5);">
            <div class="modal-dialog" style="position: relative; top: 50%; transform: translateY(-50%); margin: 0 auto; max-width: 500px;">
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
                            <option value="2019">2019</option>
                            <option value="2018">2018</option>
                            <option value="2017">2017</option>
                            <option value="2016">2016</option>
                            <option value="2015">2015</option>
                            <option value="2014">2014</option>
                            <option value="2013">2013</option>
                            <option value="2012">2012</option>
                            <option value="2011">2011</option>
                            <option value="2010">2010</option>
                            <option value="2009">2009</option>
                            <option value="2008">2008</option>
                            <option value="2007">2007</option>
                            <option value="2006">2006</option>
                            <option value="2005">2005</option>
                            <option value="2004">2004</option>
                            <option value="2003">2003</option>
                            <option value="2002">2002</option>
                            <option value="2001">2001</option>
                            <option value="2000">2000</option>
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
                          <button class="btn btn-primary me-2" @click="refresh_data()">Refresh</button>
                          <button class="btn btn-secondary" @click="showMyModal()">Close</button>
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
        meeting_recorden:"",
        meeting_recordfr:"",
        meeting_recordes:"",
        date:"",
        topic:"",
        security_council_document:"",
        vote:"",
        refresh:Boolean,
        record:"",
        meetinglinken:"",
        meetinglinkfr:"",
        meetinglinkes:"",
        my_id:"",
        listing_id:"",
        record_link:"",
        
        // Press Release text
        press_release_text_en:"",
        press_release_text_fr:"",
        press_release_text_es:"",

        // Press Release link
        press_release_link_en:"",
        press_release_link_fr:"",
        press_release_link_es:"",

        // Press Release prefix
        press_release_text_prefix_en:"",
        press_release_text_prefix_fr:"",
        press_release_text_prefix_es:"",

        // Press Release sufix
        press_release_text_sufix_en:"",
        press_release_text_sufix_fr:"",
        press_release_text_sufix_es:"",

      }
    },
    
    created:async function(){
      // loading all the meetings ID
      const my_response = await fetch("./getsclistingsId");
      const my_data = await my_response.json();
      my_data.forEach(element => {
        this.meetingsIds.push(element)
      });
    },

    methods:{
      addRow() {
        // Adds a new row with three empty cells
       this.AddOutcomeEmpty()
      },
      removeRow(index) {
        // Check if there's only 1 outcome left
        if (this.outcomes.length <= 1) {
          showWarning("Cannot remove the last outcome. At least one outcome must remain.");
          return;
        }
        // Removes a row at the specified index
        this.outcomes.splice(index, 1);
        showSuccess("Outcome removed successfully!");
      },
      openFTP(){
        showWarning("define the ftp")
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
       
      },
      // Ensure record has expected array structures to avoid undefined index access in templates
      normalizeRecord(record) {
        record = record || {}

        // Ensure arrays for date/topic exist and have 6 language slots (EN,FR,ES,RU,AR,ZH)
        const langs = ['EN','FR','ES','RU','AR','ZH']
        function ensureLangArray(arr) {
          const out = []
          arr = Array.isArray(arr) ? arr : []
          for (let i = 0; i < langs.length; i++) {
            const existing = arr[i] || {}
            out.push({ lang: langs[i], value: (existing && existing.value) ? existing.value : '' })
          }
          return out
        }

        record.date = ensureLangArray(record.date)
        record.topic = ensureLangArray(record.topic)

        // Ensure meeting_record link fields
        record.meeting_record_link = record.meeting_record_link || ''
        record.meeting_record_link_en = record.meeting_record_link_en || record.meeting_record_link || ''
        record.meeting_record_link_fr = record.meeting_record_link_fr || ''
        record.meeting_record_link_es = record.meeting_record_link_es || ''

        // Normalize press_release into language-specific press release fields if present elsewhere
        // Ensure press release text/prefix/sufix and link exist for expected languages
        const prLangs = ['en','fr','es','ru','ar','zh']
        prLangs.forEach(l => {
          record['press_release_text_prefix_' + l] = record['press_release_text_prefix_' + l] || ''
          record['press_release_text_' + l] = record['press_release_text_' + l] || ''
          record['press_release_text_sufix_' + l] = record['press_release_text_sufix_' + l] || ''
          record['press_release_link_' + l] = record['press_release_link_' + l] || ''
        })

        // Outcomes: ensure at least one outcome exists and each outcome has 6 language slots
        if (!Array.isArray(record.outcomes) || record.outcomes.length === 0) {
          record.outcomes = [{ outcome_vote: '', outcome: langs.map(l => ({ lang: l, outcome_text: '', outcome_text_link: '', outcome_text_prefix: '', outcome_text_sufix: '' })) }]
        } else {
          record.outcomes = record.outcomes.map(oc => {
            const out = oc || {}
            out.outcome_vote = out.outcome_vote || ''
            out.outcome = Array.isArray(out.outcome) ? out.outcome : []
            const newOutcome = []
            for (let i = 0; i < langs.length; i++) {
              const existing = out.outcome[i] || {}
              newOutcome.push({
                lang: existing.lang || langs[i],
                outcome_text: existing.outcome_text || '',
                outcome_text_link: existing.outcome_text_link || '',
                outcome_text_prefix: existing.outcome_text_prefix || '',
                outcome_text_sufix: existing.outcome_text_sufix || ''
              })
            }
            out.outcome = newOutcome
            return out
          })
        }

        // Ensure other commonly referenced fields exist
        record.listing_id = record.listing_id || ''
        record.meeting_record_en = record.meeting_record_en || record.meeting_record || ''
        record.meeting_record_fr = record.meeting_record_fr || ''
        record.meeting_record_es = record.meeting_record_es || ''

        return record
      },

      getArrayValue(record, fieldName, lang) {
        try {
          const langIndex = { EN: 0, FR: 1, ES: 2, RU: 3, AR: 4, ZH: 5 }[lang] || 0
          if (!record || !record[fieldName]) return ''
          const entry = record[fieldName][langIndex]
          return (entry && entry.value) ? entry.value : ''
        } catch (e) {
          return ''
        }
      },
      getOutcomeField(my_record, langIndex, field) {
        try {
          if (!my_record || !my_record.outcome) return ''
          const entry = my_record.outcome[langIndex]
          return (entry && entry[field]) ? entry[field] : ''
        } catch (e) {
          return ''
        }
      },
      normalizePressRelease(value) {
        if (value === undefined || value === null) return '(no press release)'
        if (typeof value === 'string') return value
        if (Array.isArray(value) && value.length > 0) return (value[0] && value[0].value) ? value[0].value : '(no press release)'
        if (typeof value === 'object' && value.value) return value.value
        return '(no press release)'
      },
      showMyModal() {
        
        let modalElement = document.getElementById('reject')
    
        if (modalElement && modalElement.style.display === 'block') {
            // Hide modal
            modalElement.style.display = 'none'
        }
        else {
            // Show modal
            if (modalElement) {
                modalElement.style.display = 'block'
            }
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
      renderDataJSON(my_meeting,my_language){
        // getting values for the meeting and the language selected
        const my_meeting_value=document.getElementById(my_meeting).value
        const my_language_value=document.getElementById(my_language).value
        // getting the domain
         const my_location=window.location.toString()
         const my_string_to_replace="/datasetSecurityCounsel"
         const my_final_location=my_location.replace(my_string_to_replace,'')
         // generation of the url to open
         const url=`${my_final_location}/render_meeting/${my_meeting_value}/json/${my_language_value}`
        
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
      this.listOfRecords = []
      const my_response = await fetch("./getsclistings/" + myMeetingValue);
      const my_data = await my_response.json();
      
      my_data.forEach(element => {
        // We find the meeting
        if (element["listing_id"]===myMeetingValue){
            this.listOfRecords.push(this.normalizeRecord(element))
          }
        })
      this.initPage=false
      this.displayRecordFromQuery=true
      console.log(this.listOfRecords)
      
      },

      openRecord(record){

        this.listOfRecords.forEach(element => {
          if (element.meeting_record==record) {

              this.my_id=element._id.$oid
             
              this.meeting_record_link=element.meeting_record_link
              this.listing_id=element.listing_id

              // meeting management
               this.record=element.meeting_record // this one should be removed in the future
               this.meeting_record=element.meeting_record
               this.meeting_recorden=element.meeting_record_en
               this.meeting_recordfr=element.meeting_record_fr  
               this.meeting_recordes=element.meeting_record_es  

              // meeting link management
              this.meetinglinken=element.meeting_record_link
              this.meetinglinkfr=element.meeting_record_link_fr
              this.meetinglinkes=element.meeting_record_link_es
              

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
              
              // Management of the outcome text depending of the language
              if (this.languageSelected==='EN') {
                if (element.outcomes[0].outcome[0].outcome_text) {
                  this.security_council_document=element.outcomes[0].outcome[0].outcome_text
                }
                else {
                  this.security_council_document=''
                }
              }

            if (this.languageSelected==='FR') {
              if (element.outcomes[0].outcome[1].outcome_text) {
                this.security_council_document=element.outcomes[0].outcome[1].outcome_text
              }
              else {
                this.security_council_document=''
              }
            }

            if (this.languageSelected==='ES') {
              if (element.outcomes[0].outcome[2].outcome_text) {
                this.security_council_document=element.outcomes[0].outcome[2].outcome_text
              }
              else {
                this.security_council_document=''
              }
            }
            
            if (this.languageSelected==='RU') {
              if (element.outcomes[0].outcome[3].outcome_text) {
                this.security_council_document=element.outcomes[0].outcome[3].outcome_text
              }
              else {
                this.security_council_document=''
              }
            }

            if (this.languageSelected==='AR') {
              if (element.outcomes[0].outcome[4].outcome_text) {
                this.security_council_document=element.outcomes[0].outcome[4].outcome_text
              }
              else {
                this.security_council_document=''
              }
            }              

            if (this.languageSelected==='ZH') {
              if (element.outcomes[0].outcome[5].outcome_text) {
                this.security_council_document=element.outcomes[0].outcome[5].outcome_text
              }
              else {
                this.security_council_document=''
              }
            }  

            this.refresh=element.refresh
            
            this.outcomes=element.outcomes

            // Press Release text
            this.press_release_text_en=element.press_release_text_en || ""
            this.press_release_text_fr=element.press_release_text_fr || ""
            this.press_release_text_es=element.press_release_text_es || ""

            // Press Release link
            this.press_release_link_en=element.press_release_link_en || ""
            this.press_release_link_fr=element.press_release_link_fr || ""
            this.press_release_link_es=element.press_release_link_es || ""

            // Press Release prefix
            this.press_release_text_prefix_en=element.press_release_text_prefix_en || ""
            this.press_release_text_prefix_fr=element.press_release_text_prefix_fr || ""
            this.press_release_text_prefix_es=element.press_release_text_prefix_es || ""

            // Press Release sufix
            this.press_release_text_sufix_en=element.press_release_text_sufix_en || ""
            this.press_release_text_sufix_fr=element.press_release_text_sufix_fr || ""
            this.press_release_text_sufix_es=element.press_release_text_sufix_es || ""

          }
        });
      },
      async createRecord(){
        let dataset = new FormData()
        
        // meeting record management
        dataset.append('meeting_record',this.record)
        dataset.append('meeting_record_en',this.meeting_recorden)
        dataset.append('meeting_record_fr',this.meeting_recordfr)
        dataset.append('meeting_record_es',this.meeting_recordes)
        dataset.append('meeting_record_link',this.record_link)
        dataset.append('topic',this.topic)
        dataset.append('date',this.date)
       
        // meeting link management
        dataset.append('meeting_record_link',this.meetinglinken)
        dataset.append('meeting_record_link_es',this.meetinglinkes)
        dataset.append('meeting_record_link_fr',this.meetinglinkfr)
        const my_outcomes=JSON.stringify(this.outcomes)
        dataset.append('outcomes',my_outcomes)
        dataset.append('refresh',this.refresh)
        dataset.append('listing_id',this.listing_id)
        dataset.append('languageSelected',"EN")
        // adding press release
        // Press Release text
        dataset.append('press_release_text_en',this.press_release_text_en)
        dataset.append('press_release_text_fr',this.press_release_text_fr)
        dataset.append('press_release_text_es',this.press_release_text_es)

        // Press Release link
        dataset.append('press_release_link_en',this.press_release_link_en)
        dataset.append('press_release_link_fr',this.press_release_link_fr)
        dataset.append('press_release_link_es',this.press_release_link_es)

        // Press Release prefix
        dataset.append('press_release_text_prefix_en',this.press_release_text_prefix_en)
        dataset.append('press_release_text_prefix_fr',this.press_release_text_prefix_fr)
        dataset.append('press_release_text_prefix_es',this.press_release_text_prefix_es)

        // Press Release sufix
        dataset.append('press_release_text_sufix_en',this.press_release_text_sufix_en)
        dataset.append('press_release_text_sufix_fr',this.press_release_text_sufix_fr)
        dataset.append('press_release_text_sufix_es',this.press_release_text_sufix_es)

        const my_response = await fetch("./create_sc_listing",{
          "method":"POST",
          "body":dataset
          });
        const my_data = await my_response.json();
        this.displayRecordFromQuery=true
        showSuccess("Record created!!!")
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      async updateRecord(){
        
        let dataset = new FormData()
        dataset.append('_id',this.my_id)
        //dataset.append('meeting_record',this.record)
        dataset.append('meeting_record_en',this.meeting_recorden)
        dataset.append('meeting_record_fr',this.meeting_recordfr)
        dataset.append('meeting_record_es',this.meeting_recordes)
        dataset.append('name',this.name)
        dataset.append('topic',this.topic)
        dataset.append('date',this.date)
        dataset.append('meeting_record_link',this.meetinglinken)
        dataset.append('meeting_record_link_es',this.meetinglinkes)
        dataset.append('meeting_record_link_fr',this.meetinglinkfr)
        const my_outcomes=JSON.stringify(this.outcomes)
        dataset.append('outcomes',my_outcomes)
        dataset.append('refresh',this.refresh)
        dataset.append('languageSelected',this.languageSelected)
        // adding press release
        // Press Release text
        dataset.append('press_release_text_en',this.press_release_text_en)
        dataset.append('press_release_text_fr',this.press_release_text_fr)
        dataset.append('press_release_text_es',this.press_release_text_es)

        // Press Release link
        dataset.append('press_release_link_en',this.press_release_link_en)
        dataset.append('press_release_link_fr',this.press_release_link_fr)
        dataset.append('press_release_link_es',this.press_release_link_es)

        // Press Release prefix
        dataset.append('press_release_text_prefix_en',this.press_release_text_prefix_en)
        dataset.append('press_release_text_prefix_fr',this.press_release_text_prefix_fr)
        dataset.append('press_release_text_prefix_es',this.press_release_text_prefix_es)

        // Press Release sufix
        dataset.append('press_release_text_sufix_en',this.press_release_text_sufix_en)
        dataset.append('press_release_text_sufix_fr',this.press_release_text_sufix_fr)
        dataset.append('press_release_text_sufix_es',this.press_release_text_sufix_es)
        const my_response = await fetch("./update_sc_listing",{
          "method":"PUT",
          "body":dataset
          });
        const my_data = await my_response.json();
        this.displayRecordFromQuery=true
        showSuccess("Record updated!!!")
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      displayUpdateRecordFromQuery(){
        
        this.displayRecordFromQuery=false
        this.updateRecordFromQuery=true
      },
      showDeleteConfirmation() {
        console.log('showDeleteConfirmation called for Security Council record');
        
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
              Delete this Security Council record?
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
          this.confirmDeleteRecord();
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
      
      async confirmDeleteRecord(){
        let dataset = new FormData()
        dataset.append('_id',this.my_id)
        const my_response = await fetch("./delete_sc_listing",{
          "method":"POST",
          "body":dataset
          });
        const my_data = await my_response.json();
        this.deleteRecordFromQuery=false
        showSuccess("Record deleted!!!")
        setTimeout(() => {
          location.reload();
        }, 2000);
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
        showInfo("The process has started the data will be updated in few seconds!!!")
        const my_response = await fetch("./refresh_data",{
          "method":"POST",
          "body":dataset
          }); 
          const my_data = await my_response.json();  
        showInfo(my_data["message"])
      },
    async exportDataToJson(listofmeetings,listoflanguages){

      // clearing the variables
      this.listOfRecords=[]
          
          //retrieve the parameters
          const myMeeting = document.getElementById(listofmeetings);
          const myMeetingValue = myMeeting.value;      
  
          const myLanguage = document.getElementById(listoflanguages);
          const myLanguageValue = myLanguage.value;  
          

          // assign the languages
          this.meetingSelected=myLanguageValue
          this.languageSelected=myLanguageValue

          // // loading all the data
          const my_response = await fetch("./exportjson/" + myMeetingValue);
          const my_data = await my_response.json();
          
          my_data.forEach(element => {
            // We find the meeting
            if (element["listing_id"]===myMeetingValue){
                this.listOfRecords.push(this.normalizeRecord(element))
              }
            })
          let myFileName="extract_security_counsel_table"+Date.now()+".json"
          this.downloadJsonFile(this.listOfRecords,myFileName) 
      }
    ,
      async exportHTML(){
        try {
              let myData=document.getElementById("myTable")
              if (!myData) {
                showError("Table not found. Please make sure the table is displayed first.");
                return;
              }
              
              // Create a copy of the table to avoid modifying the original
              let tableCopy = myData.cloneNode(true);
              
              // Remove the Actions column from all rows (including header)
              for(const row of tableCopy.rows){
                row.deleteCell(-1);
              }
              
              let myDataHTML=tableCopy.outerHTML
              showSuccess("Your data has been exported with HTML format!!!")
              let start=`
              <div id="s-lg-content-74877231" class="  clearfix">
              <h4 style="text-align: center;">Security Council Export</h4>
              <link href="//www.un.org/depts/dhl/css/ga-table.css" rel="stylesheet" type="text/css">     
              <p style="text-align: justify;">&nbsp;</p>     
              `
              let end=`
              </div>
              `
              let element = document.createElement('a');
              element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(start + myDataHTML + end));
              element.setAttribute('download', `extract_security_council_table_${Date.now()}.html`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
        } catch (error) {
          showError("Error exporting HTML: " + error.message)
        }
      },    
      downloadJsonFile(data, filename) {
        // Creating a blob object from non-blob data using the Blob constructor
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        // Create a new anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        a.click();
        a.remove();
     },
      exportExcel(tableName) {
        try {
          const tableElement = document.getElementById(tableName);
          if (!tableElement) {
            showError("Table not found. Please make sure the table is displayed first.");
            return;
          }
          
          const uri = 'data:application/vnd.ms-excel;base64,';
          const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
          const base64 = function(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
          };
          const format = function(s, c) {
            return s.replace(/{(\w+)}/g, function(m, p) {
              return c[p];
            });
          };
          
          // Create a copy of the table to avoid modifying the original
          let tableCopy = tableElement.cloneNode(true);
          
          // Remove the Actions column from all rows
          for(const row of tableCopy.rows){
            row.deleteCell(-1);
          }
          
          // Process each cell to handle multiline content
          for(const row of tableCopy.rows){
            for(const cell of row.cells){
              // Replace <br> tags with spaces and remove HTML tags
              let cellText = cell.innerHTML;
              cellText = cellText.replace(/<br\s*\/?>/gi, ' '); // Replace <br> with space
              cellText = cellText.replace(/<[^>]*>/g, ''); // Remove all HTML tags
              cellText = cellText.replace(/\s+/g, ' ').trim(); // Clean up multiple spaces
              cell.innerHTML = cellText;
            }
          }
          
          var toExcel = tableCopy.outerHTML;
          var ctx = {
            worksheet: 'Security Council',
            table: toExcel
          };
          var link = document.createElement("a");
          link.download = `security_council_export_${Date.now()}.xls`;
          link.href = uri + base64(format(template, ctx));
          link.click();
          
          showSuccess("Excel file exported successfully!");
        } catch (error) {
          showError("Error exporting Excel: " + error.message);
        }
      },
    },
    components: {}
  }
  )

let app_datasetssecuritycounsel = new Vue({
    el: '#dldatasetssecuritycounsel'
})

  
  
  