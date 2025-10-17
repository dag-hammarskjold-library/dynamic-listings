Vue.component('displaylistdatasetgaresolutionscomponent',{
    props: ["title",'prefix'],
    template: `
     <div class="container" id="test" style="min-height: 70vh;">
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
        
        <div v-if="displayFTP" class="row mt-3">
              <div class="col">
                <button type="button" class="btn btn-primary" @click="document.location.reload(true);">
                  Go Back
                </button>
              </div>
            </div>
        </div>
        
        <div v-if="displayRecordFromQuery" class="mt-4">
          <div class="row mb-3">
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
          <table v-if="languageSelected==='EN'" id="myTable" class="table table-striped" summary="">
                  <tbody>
                      <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Resolution No</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Plenary or Cttee</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Agenda Item No</th>
                          <th width="25%" style="border: 1px solid black;border-collapse: collapse;">Meeting Record / Date / Vote </th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Draft</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Title</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Actions</th>
                      </tr>

                      <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <a :href="record.Resolution_link_en || '#'"  target="_blank">  {{record.Resolution_prefix_en || ''}} {{record.Resolution_en || ''}}  {{record.Resolution_sufix_en || ''}} </a>
                          </td>
                         
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Plenary_en || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Agenda_numbers_en || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">                              
                               {{record.Meeting_prefix_en || ''}} {{record.Meeting_en || ''}} {{record.Meeting_sufix_en || ''}}<br>
                               {{record.date_en || ''}} <br>
                               {{record.Vote_en || ''}}

                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                 {{record.Draft_Resolution_prefix_en || ''}} {{record.Draft_Resolution_en || ''}} {{record.Draft_Resolution_sufix_en || ''}}
                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                {{record.Title_prefix_en || ''}} {{record.Title_en || ''}}  {{record.Title_sufix_en || ''}}

                          </td>


                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-pen"></i></span>  
                              <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-trash-alt"></i></span>               
                          </td>
                      </tr>
                  </tbody>
          </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='ES'" id="myTable" class="tablefont table-condensed" resumen="La tabla tiene cinco columnas y debe leerse por fila. La primera columna indica el documento símbolo del acta de la reunión, que está vinculado al documento real en formato PDF.La segunda columna muestra la fecha de la reunión, la tercera columna es el símbolo del comunicado de prensa emitido sobre la reunión.La cuarta columna proporciona información sobre el tema de la reunión. Y finalmente la quinta columna da detalles de la acción.tomado con enlaces proporcionados al documento real en formato PDF si se ha emitido una declaración presidencial o se ha adoptado una resolución.">
          <tbody>
                    <tr style="border: 1px solid black;border-collapse: collapse;">
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Número de resolución</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Plenaria o Comisión</th>
                          <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Tema del programa</th>
                          <th width="25%" style="border: 1px solid black;border-collapse: collapse;">Acta de la sesión/Fecha/Votación </th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Proyecto de resolución</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Titulo</th>
                          <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Acciones</th>
                    </tr>
                    <tr  v-for="record in listOfRecords"  style="border: 1px solid black;border-collapse: collapse;">
                        
                    
                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <a :href="record.Resolution_link_es || '#'"  target="_blank">  {{record.Resolution_prefix_es || ''}} {{record.Resolution_es || ''}}  {{record.Resolution_sufix_es || ''}} </a>
                          </td>
                         
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Plenary_es || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Agenda_numbers_es || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">                              
                               {{record.Meeting_prefix_es || ''}} {{record.Meeting_es || ''}} {{record.Meeting_sufix_es || ''}}<br>
                               {{record.date_es || ''}} <br>
                               {{record.Agenda_numbers_es || ''}}

                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                 {{record.Draft_Resolution_prefix_es || ''}} {{record.Draft_Resolution_es || ''}} {{record.Draft_Resolution_sufix_es || ''}}
                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                {{record.Title_prefix_es || ''}} {{record.Title_es || ''}}  {{record.Title_sufix_es || ''}}
                          </td>

                        <td style="border: 1px solid black;border-collapse: collapse;">

                            <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-pen"></i></span>
                            <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-trash-alt"></i></span>
                        </td>
                    </tr>
                </tbody>
        </table>

      <table style="width:858px;border: 1px solid black;border-collapse: collapse;" v-if="languageSelected==='FR'" id="myTable" class="tablefont table-condensed" resume="Le tableau comporte cinq colonnes et doit être lu par ligne. La première colonne indique le document symbole du compte rendu de la réunion, qui est lié au document lui-même au format PDF.La deuxième colonne indique la date de la réunion, la troisième colonne est le symbole du communiqué de presse publié sur la réunion.La quatrième colonne fournit des informations sur le sujet de la réunion. Et enfin la cinquième colonne détaille l'action pris avec des liens fournis vers le document lui-même au format PDF si une déclaration présidentielle a été publiée ou une résolution adoptée.">
          <tbody>
              <tr style="border: 1px solid black;border-collapse: collapse;">
                  <th width="15%" style="border: 1px solid black;border-collapse: collapse;">No de résolution</th>
                  <th width="15%" style="border: 1px solid black;border-collapse: collapse;">Plénière ou Comité</th>
                  <th width="15%" style="border: 1px solid black;border-collapse: collapse;">No de l'ordre du jour</th>
                  <th width="25%" style="border: 1px solid black;border-collapse: collapse;">Compte rendu de séance / Date / Vote</th>
                  <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Projet</th>
                  <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Sujet</th>
                  <th width="10%" style="border: 1px solid black;border-collapse: collapse;">Actions</th>
              </tr>
              <tr  v-for="record in listOfRecords" style="border: 1px solid black;border-collapse: collapse;">
                  
                          <td style="border: 1px solid black;border-collapse: collapse;">
                              <a :href="record.Resolution_link_fr || '#'"  target="_blank">  {{record.Resolution_prefix_fr || ''}} {{record.Resolution_fr || ''}}  {{record.Resolution_sufix_fr || ''}} </a>
                          </td>
                         
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Plenary_fr || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">
                               {{record.Agenda_numbers_fr || ''}}
                          </td>
                          
                          <td style="border: 1px solid black;border-collapse: collapse;">                              
                               {{record.Meeting_prefix_fr || ''}} {{record.Meeting_fr || ''}} {{record.Meeting_sufix_fr || ''}}<br>
                               {{record.date_fr || ''}} <br>
                               {{record.Agenda_numbers_fr || ''}}

                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                 {{record.Draft_Resolution_prefix_fr || ''}} {{record.Draft_Resolution_fr || ''}} {{record.Draft_Resolution_sufix_fr || ''}}
                          </td>

                          <td style="border: 1px solid black;border-collapse: collapse;">
                                {{record.Title_prefix_fr || ''}} {{record.Title_fr || ''}}  {{record.Title_sufix_fr || ''}}
                          </td>

                  <td style="border: 1px solid black;border-collapse: collapse;">

                      <span class="badge rounded-pill bg-warning" @click="displayRecordFromQuery=false;updateRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-pen"></i></span>
                      <span class="badge rounded-pill bg-danger"  @click="displayRecordFromQuery=false;deleteRecordFromQuery=true;openRecord(record.Resolution || '')"><i class="fas fa-trash-alt"></i></span>
                  </td>
              </tr>
          </tbody>
  </table>



        </div>

        <div v-if="updateRecordFromQuery">
                <div class="mb-3">
                  <h3 v-if="languageSelected==='EN'" class="text-primary font-weight-bold"> This update will affect the record in English </h3>
                  <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> Cette mise à jour affectera l'enregistrement </h3>
                  <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> Esta actualización afectará el registro en español </h3>
                  <h3 v-if="languageSelected==='RU'" class="text-primary font-weight-bold"> This update will affect the record in Russian</h3>
                  <h3 v-if="languageSelected==='AR'" class="text-primary font-weight-bold"> This update will affect the record in Arabic </h3>
                  <h3 v-if="languageSelected==='ZH'" class="text-primary font-weight-bold"> This update will affect the record in Chinese</h3>
                </div> 
                <hr> 
                <form @submit.prevent="">
    
                  <!-- ------------------- ENGLISH ----------------------- --> 

                      <div v-if="languageSelected==='EN'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                            <div class="mb-1">
                                <label for="Resolution_prefix_en" class="form-label">Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_prefix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_en" class="form-label">Resolution  </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_sufix_en" class="form-label">Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_sufix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Plenary_en" class="form-label">Plenary </label>
                                <input class="form-control mt-2" v-model="outcome.Plenary_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Agenda_numbers_en" class="form-label">Agenda Numbers </label>
                                <input class="form-control mt-2" v-model="outcome.Agenda_numbers_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_prefix_en" class="form-label">Meeting prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_prefix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_en" class="form-label">Meeting </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_sufix_en" class="form-label">Meeting sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_sufix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_prefix_en" class="form-label">Draft Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_prefix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_Resolution_en" class="form-label">Draft Resolution </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_sufix_en" class="form-label">Draft Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_sufix_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_prefix_en" class="form-label">Title Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_prefix_en"/><br>
                            </div>
                            
                            <div class="mb-1">
                                <label for="Title_en" class="form-label">Title </label>
                                <input class="form-control mt-2" v-model="outcome.Title_en"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_sufix_en" class="form-label">Title Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_sufix_en"/><br>
                            </div>
          
                            <div class="mb-1">
                                <label for="date_en" class="form-label">Date </label>
                                <input class="form-control mt-2" v-model="outcome.date_en"/><br>
                            </div>
                            
                            <div class="mb-1">
                              <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcome.refresh">
                              <label class="form-check-label" for="flexCheckDefault">
                                Allow Refresh
                              </label>
                            </div>

                      </div>                  

          <!-- ------------------- SPANISH ----------------------- --> 

            <div v-if="languageSelected==='ES'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                            <div class="mb-1">
                                <label for="Resolution_prefix_es" class="form-label">Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_prefix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_es" class="form-label">Resolution  </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_sufix_es" class="form-label">Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_sufix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Plenary_es  " class="form-label">Plenary </label>
                                <input class="form-control mt-2" v-model="outcome.Plenary_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Agenda_numbers_es " class="form-label">Agenda Numbers </label>
                                <input class="form-control mt-2" v-model="outcome.Agenda_numbers_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_prefix_es" class="form-label">Meeting prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_prefix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_es" class="form-label">Meeting </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_sufix_es" class="form-label">Meeting sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_sufix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_prefix_es" class="form-label">Draft Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_prefix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_Resolution_es" class="form-label">Draft Resolution </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_sufix_es" class="form-label">Draft Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_sufix_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_prefix_es" class="form-label">Title Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_prefix_es"/><br>
                            </div>
                            
                            <div class="mb-1">
                                <label for="Title_es" class="form-label">Title </label>
                                <input class="form-control mt-2" v-model="outcome.Title_es"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_sufix_es" class="form-label">Title Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_sufix_es"/><br>
                            </div>
          
                            <div class="mb-1">
                                <label for="date_es" class="form-label">Date </label>
                                <input class="form-control mt-2" v-model="outcome.date_es"/><br>
                            </div>
                            
                            <div class="mb-1">
                              <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcome.refresh">
                              <label class="form-check-label" for="flexCheckDefault">
                                Allow Refresh
                              </label>
                            </div>

                      </div>                     

                      <!-- ------------------- FRENCH ----------------------- --> 

                      <div v-if="languageSelected==='FR'" v-for="(outcome, index) in outcomes" :key="index" class="row">

                            <div class="mb-1">
                                <label for="Resolution_prefix_fr" class="form-label">Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_prefix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_fr" class="form-label">Resolution  </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_sufix_fr" class="form-label">Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Resolution_sufix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Plenary_fr" class="form-label">Plenary </label>
                                <input class="form-control mt-2" v-model="outcome.Plenary_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Agenda_numbers_fr" class="form-label">Agenda Numbers </label>
                                <input class="form-control mt-2" v-model="outcome.Agenda_numbers_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_prefix_fr" class="form-label">Meeting prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_prefix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_fr" class="form-label">Meeting </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Meeting_sufix_fr" class="form-label">Meeting sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Meeting_sufix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_prefix_fr" class="form-label">Draft Resolution Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_prefix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Resolution_Resolution_fr" class="form-label">Draft Resolution </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Draft_Resolution_sufix_fr" class="form-label">Draft Resolution Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Draft_Resolution_sufix_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_prefix_fr" class="form-label">Title Prefix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_prefix_fr"/><br>
                            </div>
                            
                            <div class="mb-1">
                                <label for="Title_fr" class="form-label">Title </label>
                                <input class="form-control mt-2" v-model="outcome.Title_fr"/><br>
                            </div>

                            <div class="mb-1">
                                <label for="Title_sufix_fr" class="form-label">Title Sufix </label>
                                <input class="form-control mt-2" v-model="outcome.Title_sufix_fr"/><br>
                            </div>
          
                            <div class="mb-1">
                                <label for="date_fr" class="form-label">Date </label>
                                <input class="form-control mt-2" v-model="outcome.date_fr"/><br>
                            </div>
                            
                            <div class="mb-1">
                              <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcome.refresh">
                              <label class="form-check-label" for="flexCheckDefault">
                                Allow Refresh
                              </label>
                            </div>

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

             

              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcome.refresh">
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
              <h3 v-if="languageSelected==='FR'" class="text-primary font-weight-bold"> Cette suppression affectera l'enregistrement </h3>
              <h3 v-if="languageSelected==='ES'" class="text-primary font-weight-bold"> Esta eliminación afectará el registro en español </h3>
            </div>
            <hr>
            <form @submit.prevent="">
              <div v-if="languageSelected==='EN'">
              
                <div class="mb-1"><label class="form-label">Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Resolution_prefix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution</label><input class="form-control" v-model="outcomes[0].Resolution_en" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Resolution_sufix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Plenary</label><input class="form-control" v-model="outcomes[0].Plenary_en" disabled></div>
                <div class="mb-1"><label class="form-label">Agenda Numbers</label><input class="form-control" v-model="outcomes[0].Agenda_numbers_en" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Prefix</label><input class="form-control" v-model="outcomes[0].Meeting_prefix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting</label><input class="form-control" v-model="outcomes[0].Meeting_en" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Sufix</label><input class="form-control" v-model="outcomes[0].Meeting_sufix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_prefix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_en" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_sufix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Title Prefix</label><input class="form-control" v-model="outcomes[0].Title_prefix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Title</label><input class="form-control" v-model="outcomes[0].Title_en" disabled></div>
                <div class="mb-1"><label class="form-label">Title Sufix</label><input class="form-control" v-model="outcomes[0].Title_sufix_en" disabled></div>
                <div class="mb-1"><label class="form-label">Date</label><input class="form-control" v-model="outcomes[0].date_en" disabled></div>
                <div class="mb-1">
                  <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcomes[0].refresh" disabled>  
                  <label class="form-check-label" for="flexCheckDefault">
                    Allow Refresh
                  </label>
                </div>
              </div>
              <div v-if="languageSelected==='FR'">
                <div class="mb-1"><label class="form-label">Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Resolution_prefix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution</label><input class="form-control" v-model="outcomes[0].Resolution_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Resolution_sufix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Plenary</label><input class="form-control" v-model="outcomes[0].Plenary_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Agenda Numbers</label><input class="form-control" v-model="outcomes[0].Agenda_numbers_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Prefix</label><input class="form-control" v-model="outcomes[0].Meeting_prefix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting</label><input class="form-control" v-model="outcomes[0].Meeting_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Sufix</label><input class="form-control" v-model="outcomes[0].Meeting_sufix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_prefix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_sufix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Title Prefix</label><input class="form-control" v-model="outcomes[0].Title_prefix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Title</label><input class="form-control" v-model="outcomes[0].Title_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Title Sufix</label><input class="form-control" v-model="outcomes[0].Title_sufix_fr" disabled></div>
                <div class="mb-1"><label class="form-label">Date</label><input class="form-control" v-model="outcomes[0].date_fr" disabled></div>
                <div class="mb-1">
                  <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcomes[0].refresh" disabled>  
                  <label class="form-check-label" for="flexCheckDefault">
                    Allow Refresh
                  </label>
                </div>
              </div>
              <div v-if="languageSelected==='ES'">
                <div class="mb-1"><label class="form-label">Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Resolution_prefix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution</label><input class="form-control" v-model="outcomes[0].Resolution_es" disabled></div>
                <div class="mb-1"><label class="form-label">Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Resolution_sufix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Plenary</label><input class="form-control" v-model="outcomes[0].Plenary_es" disabled></div>
                <div class="mb-1"><label class="form-label">Agenda Numbers</label><input class="form-control" v-model="outcomes[0].Agenda_numbers_es" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Prefix</label><input class="form-control" v-model="outcomes[0].Meeting_prefix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting</label><input class="form-control" v-model="outcomes[0].Meeting_es" disabled></div>
                <div class="mb-1"><label class="form-label">Meeting Sufix</label><input class="form-control" v-model="outcomes[0].Meeting_sufix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Prefix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_prefix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_es" disabled></div>
                <div class="mb-1"><label class="form-label">Draft Resolution Sufix</label><input class="form-control" v-model="outcomes[0].Draft_Resolution_sufix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Title Prefix</label><input class="form-control" v-model="outcomes[0].Title_prefix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Title</label><input class="form-control" v-model="outcomes[0].Title_es" disabled></div>
                <div class="mb-1"><label class="form-label">Title Sufix</label><input class="form-control" v-model="outcomes[0].Title_sufix_es" disabled></div>
                <div class="mb-1"><label class="form-label">Date</label><input class="form-control" v-model="outcomes[0].date_es" disabled></div>
                <div class="mb-1">
                  <input class="form-check-input" type="checkbox" name="refresh" id="refresh" v-model="outcomes[0].refresh" disabled>  
                  <label class="form-check-label" for="flexCheckDefault">
                    Allow Refresh
                  </label>
                </div>
              </div>
              <hr>
              <button type="submit" class="btn btn-primary" @click="showDeleteConfirmation()"> Delete your record </button>
              <button class="btn btn-primary" @click="location.reload()">Back to previous windows</button>
            </form>
        </div>

        <div class="modal" id="reject" role="dialog" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1055; background: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                  <div class="modal-content">
                        <div class="modal-header">
                          <h4 class="modal-title">Refreshing Data process</h4>
                          <button type="button" class="close" @click="showMyModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                        <label class="form-label"><strong>Please select the session</strong></label>
                          <select id="session" class="form-select mb-3" aria-label="Default select example">
                            <option value="90">90</option>
                            <option value="89">89</option>
                            <option value="88">88</option>
                            <option value="87">87</option>
                            <option value="86">86</option>
                            <option value="85">85</option>
                            <option value="84">84</option>
                            <option value="83">83</option>
                            <option value="82">82</option>
                            <option value="81">81</option>
                            <option value="80">80</option>
                            <option value="79">79</option>
                            <option value="78">78</option>
                            <option value="77">77</option>
                            <option value="76">76</option>
                            <option value="75">75</option>
                            <option value="74">74</option>
                            <option value="73">73</option>
                            <option value="72">72</option>
                            <option value="71">71</option>
                            <option value="70">70</option>
                            </select>
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
                          <button class="btn btn-primary me-2" @click="refresh_data_ga()">Refresh</button>
                          <button class="btn btn-secondary" @click="showMyModal()">Close</button>
                        </div>
                    </div>
            </div>
        </div>
  
     </div>`,


    data: function () {
      return {
        initPage: true,
        displayFTP: false,
        meetingsIds: [],
        languageSelected: "",
        displayRecordFromQuery: false,
        updateRecordFromQuery: false,
        createRecordFromQuery: false,
        deleteRecordFromQuery: false,
        prefix: this.prefix,
        listOfRecords: [],
        my_id: "",
        listing_id: "",
        refresh: false,
        
        // Additional fields for create/update forms
        meeting_recorden: "",
        meeting_recordfr: "",
        meeting_recordes: "",
        meetinglinken: "",
        meetinglinkfr: "",
        meetinglinkes: "",
        record_link: "",
        date: "",
        topic: "",

        // ENGLISH FIELDS
        Plenary_en: "",
        Resolution_en: "",
        Resolution_prefix_en: "",
        Resolution_sufix_en: "",
        Agenda_numbers_en: "",
        Meeting_en: "",
        Meeting_prefix_en: "",
        Meeting_sufix_en: "",
        Draft_Resolution_en: "",
        Draft_Resolution_prefix_en: "",
        Draft_Resolution_sufix_en: "",
        Title_en: "",
        Title_prefix_en: "",
        Title_sufix_en: "",
        date_en: "",

        // FRENCH FIELDS
        Plenary_fr: "",
        Resolution_fr: "",
        Resolution_prefix_fr: "",
        Resolution_sufix_fr: "",
        Agenda_numbers_fr: "",
        Meeting_fr: "",
        Meeting_prefix_fr: "",
        Meeting_sufix_fr: "",
        Draft_Resolution_fr: "",
        Draft_Resolution_prefix_fr: "",
        Draft_Resolution_sufix_fr: "",
        Title_fr: "",
        Title_prefix_fr: "",
        Title_sufix_fr: "",
        date_fr: "",

        // SPANISH FIELDS
        Plenary_es: "",
        Resolution_es: "",
        Resolution_prefix_es: "",
        Resolution_sufix_es: "",
        Agenda_numbers_es: "",
        Meeting_es: "",
        Meeting_prefix_es: "",
        Meeting_sufix_es: "",
        Draft_Resolution_es: "",
        Draft_Resolution_prefix_es: "",
        Draft_Resolution_sufix_es: "",
        Title_es: "",
        Title_prefix_es: "",
        Title_sufix_es: "",
        date_es: "",
        
        // Outcomes array for GA Resolutions
        outcomes: []
      }
    },
    
    created:async function(){
      // loading all the meetings ID
      console.log('GA Resolutions - Component created, loading meetings...');
      const my_response = await fetch("./getgalistingsId");
      const my_data = await my_response.json();
      my_data.forEach(element => {
        this.meetingsIds.push(element)
      });
      console.log('GA Resolutions - Meetings loaded:', this.meetingsIds.length);
    },

    methods:{
      
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
        const my_string_to_replace="/datasetGAResolutions"
        const my_final_location=my_location.replace(my_string_to_replace,'')
        // generation of the url to open
        const url=`${my_final_location}/render_meeting_ga/${my_meeting_value}/${my_language_value}`
        // open the url generated
        window.open(url, '_blank').focus();
      },
      renderDataJSON(my_meeting,my_language){
        // getting values for the meeting and the language selected
        const my_meeting_value=document.getElementById(my_meeting).value
        const my_language_value=document.getElementById(my_language).value
        // getting the domain
         const my_location=window.location.toString()
         const my_string_to_replace="/datasetGAResolutions"
         const my_final_location=my_location.replace(my_string_to_replace,'')
         // generation of the url to open
         const url=`${my_final_location}/render_meeting_json_ga/${my_meeting_value}/json/${my_language_value}`
        
         // open the url generated
         window.open(url, '_blank').focus();
       },
      async displayData(listofmeetings,listoflanguages){
      // retrieve the parameters
      const myMeeting = document.getElementById(listofmeetings);
      if (!myMeeting) {
        showError('Meeting selector not found. Please refresh the page.');
        return;
      }
      const myMeetingValue = myMeeting.value;       

      const myLanguage = document.getElementById(listoflanguages);
      if (!myLanguage) {
        showError('Language selector not found. Please refresh the page.');
        return;
      }
      const myLanguageValue = myLanguage.value;  

      // assign the languages
      this.meetingSelected=myLanguageValue
      this.languageSelected=myLanguageValue

      // loading all the data
      try {
      const my_response = await fetch("./getgalistings/" + myMeetingValue)
        
        if (!my_response.ok) {
          throw new Error(`HTTP error! status: ${my_response.status}`);
        }
        
      const my_data = await my_response.json();
        
        // Clear previous records
        this.listOfRecords = [];
        
      my_data.forEach(element => {
        // We find the meeting
        if (element["listing_id"]===myMeetingValue){
            this.listOfRecords.push(element)
          }
        })
        
      this.initPage=false
      this.displayRecordFromQuery=true
      
      // Debug logging
      console.log('GA Resolutions - Data loaded:', this.listOfRecords.length, 'records');
      console.log('GA Resolutions - Language selected:', this.languageSelected);
      console.log('GA Resolutions - Display flag:', this.displayRecordFromQuery);
      } catch (error) {
        showError('Error loading data: ' + error.message);
      }
      
      },

      openRecord(record){
   
        this.outcomes = [];
        this.listOfRecords.forEach(element => {
          if (element.Resolution==record) {
              this.my_id=element._id.$oid
              this.listing_id=element.listing_id;
              this.outcomes.push(element)
          }
        });
      },
      async createRecord(){
        
        let dataset = new FormData();
        dataset.append('listing_id', this.listing_id);
        dataset.append('refresh', this.outcomes[0].refresh);
        dataset.append('languageSelected', this.languageSelected);

        // English fields
        if (this.languageSelected === 'EN') {
          dataset.append('Resolution_prefix_en', this.outcomes[0].Resolution_prefix_en);
          dataset.append('Resolution_en', this.outcomes[0].Resolution_en);
          dataset.append('Resolution_sufix_en', this.outcomes[0].Resolution_sufix_en);
          dataset.append('Plenary_en', this.outcomes[0].Plenary_en);
          dataset.append('Agenda_numbers_en', this.outcomes[0].Agenda_numbers_en);
          dataset.append('Meeting_prefix_en', this.outcomes[0].Meeting_prefix_en);
          dataset.append('Meeting_en', this.outcomes[0].Meeting_en);
          dataset.append('Meeting_sufix_en', this.outcomes[0].Meeting_sufix_en);
          dataset.append('Draft_Resolution_prefix_en', this.outcomes[0].Draft_Resolution_prefix_en);
          dataset.append('Draft_Resolution_en', this.outcomes[0].Draft_Resolution_en);
          dataset.append('Draft_Resolution_sufix_en', this.outcomes[0].Draft_Resolution_sufix_en);
          dataset.append('Title_prefix_en', this.outcomes[0].Title_prefix_en);
          dataset.append('Title_en', this.outcomes[0].Title_en);
          dataset.append('Title_sufix_en', this.outcomes[0].Title_sufix_en);
          dataset.append('date_en', this.outcomes[0].date_en);
        }
        // French fields
        else if (this.languageSelected === 'FR') {
          dataset.append('Resolution_prefix_fr', this.outcomes[0].Resolution_prefix_fr);
          dataset.append('Resolution_fr', this.outcomes[0].Resolution_fr);
          dataset.append('Resolution_sufix_fr', this.outcomes[0].Resolution_sufix_fr);
          dataset.append('Plenary_fr', this.outcomes[0].Plenary_fr);
          dataset.append('Agenda_numbers_fr', this.outcomes[0].Agenda_numbers_fr);
          dataset.append('Meeting_prefix_fr', this.outcomes[0].Meeting_prefix_fr);
          dataset.append('Meeting_fr', this.outcomes[0].Meeting_fr);
          dataset.append('Meeting_sufix_fr', this.outcomes[0].Meeting_sufix_fr);
          dataset.append('Draft_Resolution_prefix_fr', this.outcomes[0].Draft_Resolution_prefix_fr);
          dataset.append('Draft_Resolution_fr', this.outcomes[0].Draft_Resolution_fr);
          dataset.append('Draft_Resolution_sufix_fr', this.outcomes[0].Draft_Resolution_sufix_fr);
          dataset.append('Title_prefix_fr', this.outcomes[0].Title_prefix_fr);
          dataset.append('Title_fr', this.outcomes[0].Title_fr);
          dataset.append('Title_sufix_fr', this.outcomes[0].Title_sufix_fr);
          dataset.append('date_fr', this.outcomes[0].date_fr);
        }
        // Spanish fields
        else if (this.languageSelected === 'ES') {
          dataset.append('Resolution_prefix_es', this.outcomes[0].Resolution_prefix_es);
          dataset.append('Resolution_es', this.outcomes[0].Resolution_es);
          dataset.append('Resolution_sufix_es', this.outcomes[0].Resolution_sufix_es);
          dataset.append('Plenary_es', this.outcomes[0].Plenary_es);
          dataset.append('Agenda_numbers_es', this.outcomes[0].Agenda_numbers_es);
          dataset.append('Meeting_prefix_es', this.outcomes[0].Meeting_prefix_es);
          dataset.append('Meeting_es', this.outcomes[0].Meeting_es);
          dataset.append('Meeting_sufix_es', this.outcomes[0].Meeting_sufix_es);
          dataset.append('Draft_Resolution_prefix_es', this.outcomes[0].Draft_Resolution_prefix_es);
          dataset.append('Draft_Resolution_es', this.outcomes[0].Draft_Resolution_es);
          dataset.append('Draft_Resolution_sufix_es', this.outcomes[0].Draft_Resolution_sufix_es);
          dataset.append('Title_prefix_es', this.outcomes[0].Title_prefix_es);
          dataset.append('Title_es', this.outcomes[0].Title_es);
          dataset.append('Title_sufix_es', this.outcomes[0].Title_sufix_es);
          dataset.append('date_es', this.outcomes[0].date_es);
        }

        const my_response = await fetch("./create_ga_listing", {
          method: "POST",
          body: dataset
          });
        const my_data = await my_response.json();
        this.displayRecordFromQuery = true;
        showSuccess("Record created!!!");
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      async updateRecord() {
        if (!this.my_id || this.my_id === "") {
          showError("Error: No record selected for update. Please select a record first.");
          return;
        }
        let dataset = new FormData();
        dataset.append('_id', this.my_id);
        dataset.append('listing_id', this.listing_id);
        dataset.append('refresh', this.outcomes[0].refresh);
        dataset.append('languageSelected', this.languageSelected);

        // English fields
        if (this.languageSelected === 'EN') {
          dataset.append('Resolution_prefix_en', this.outcomes[0].Resolution_prefix_en);
          dataset.append('Resolution_en', this.outcomes[0].Resolution_en);
          dataset.append('Resolution_sufix_en', this.outcomes[0].Resolution_sufix_en);
          dataset.append('Plenary_en', this.outcomes[0].Plenary_en);
          dataset.append('Agenda_numbers_en', this.outcomes[0].Agenda_numbers_en);
          dataset.append('Meeting_prefix_en', this.outcomes[0].Meeting_prefix_en);
          dataset.append('Meeting_en', this.outcomes[0].Meeting_en);
          dataset.append('Meeting_sufix_en', this.outcomes[0].Meeting_sufix_en);
          dataset.append('Draft_Resolution_prefix_en', this.outcomes[0].Draft_Resolution_prefix_en);
          dataset.append('Draft_Resolution_en', this.outcomes[0].Draft_Resolution_en);
          dataset.append('Draft_Resolution_sufix_en', this.outcomes[0].Draft_Resolution_sufix_en);
          dataset.append('Title_prefix_en', this.outcomes[0].Title_prefix_en);
          dataset.append('Title_en', this.outcomes[0].Title_en);
          dataset.append('Title_sufix_en', this.outcomes[0].Title_sufix_en);
          dataset.append('date_en', this.outcomes[0].date_en);
        }
        // French fields
        else if (this.languageSelected === 'FR') {
          dataset.append('Resolution_prefix_fr', this.outcomes[0].Resolution_prefix_fr);
          dataset.append('Resolution_fr', this.outcomes[0].Resolution_fr);
          dataset.append('Resolution_sufix_fr', this.outcomes[0].Resolution_sufix_fr);
          dataset.append('Plenary_fr', this.outcomes[0].Plenary_fr);
          dataset.append('Agenda_numbers_fr', this.outcomes[0].Agenda_numbers_fr);
          dataset.append('Meeting_prefix_fr', this.outcomes[0].Meeting_prefix_fr);
          dataset.append('Meeting_fr', this.outcomes[0].Meeting_fr);
          dataset.append('Meeting_sufix_fr', this.outcomes[0].Meeting_sufix_fr);
          dataset.append('Draft_Resolution_prefix_fr', this.outcomes[0].Draft_Resolution_prefix_fr);
          dataset.append('Draft_Resolution_fr', this.outcomes[0].Draft_Resolution_fr);
          dataset.append('Draft_Resolution_sufix_fr', this.outcomes[0].Draft_Resolution_sufix_fr);
          dataset.append('Title_prefix_fr', this.outcomes[0].Title_prefix_fr);
          dataset.append('Title_fr', this.outcomes[0].Title_fr);
          dataset.append('Title_sufix_fr', this.outcomes[0].Title_sufix_fr);
          dataset.append('date_fr', this.outcomes[0].date_fr);
        }
        // Spanish fields
        else if (this.languageSelected === 'ES') {
          dataset.append('Resolution_prefix_es', this.outcomes[0].Resolution_prefix_es);
          dataset.append('Resolution_es', this.outcomes[0].Resolution_es);
          dataset.append('Resolution_sufix_es', this.outcomes[0].Resolution_sufix_es);
          dataset.append('Plenary_es', this.outcomes[0].Plenary_es);
          dataset.append('Agenda_numbers_es', this.outcomes[0].Agenda_numbers_es);
          dataset.append('Meeting_prefix_es', this.outcomes[0].Meeting_prefix_es);
          dataset.append('Meeting_es', this.outcomes[0].Meeting_es);
          dataset.append('Meeting_sufix_es', this.outcomes[0].Meeting_sufix_es);
          dataset.append('Draft_Resolution_prefix_es', this.outcomes[0].Draft_Resolution_prefix_es);
          dataset.append('Draft_Resolution_es', this.outcomes[0].Draft_Resolution_es);
          dataset.append('Draft_Resolution_sufix_es', this.outcomes[0].Draft_Resolution_sufix_es);
          dataset.append('Title_prefix_es', this.outcomes[0].Title_prefix_es);
          dataset.append('Title_es', this.outcomes[0].Title_es);
          dataset.append('Title_sufix_es', this.outcomes[0].Title_sufix_es);
          dataset.append('date_es', this.outcomes[0].date_es);
        }

        // // Debug: log all FormData entries
        // for (let pair of dataset.entries()) {
        //   console.log(pair[0]+ ': ' + pair[1]);
        // }

        const my_response = await fetch("./update_ga_listing", {
          method: "PUT",
          body: dataset
        });
        const my_data = await my_response.json();
        this.displayRecordFromQuery = true;
        showSuccess("Record updated!!!");
        setTimeout(() => {
        location.reload();
        }, 2000);
      },

      displayUpdateRecordFromQuery(){
        
        this.displayRecordFromQuery=false
        this.updateRecordFromQuery=true
      },
      showDeleteConfirmation() {
        console.log('showDeleteConfirmation called for GA Resolutions record');
        
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
              Delete this GA Resolution record?
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
      
      async confirmDeleteRecord() {
          let dataset = new FormData();
          dataset.append('_id', this.my_id);
          dataset.append('listing_id', this.listing_id);
          dataset.append('languageSelected', this.languageSelected);
          // English fields
          if (this.languageSelected === 'EN') {
            dataset.append('Resolution_prefix_en', this.Resolution_prefix_en);
            dataset.append('Resolution_en', this.Resolution_en);
            dataset.append('Resolution_sufix_en', this.Resolution_sufix_en);
            dataset.append('Plenary_en', this.Plenary_en);
            dataset.append('Agenda_numbers_en', this.Agenda_numbers_en);
            dataset.append('Meeting_prefix_en', this.Meeting_prefix_en);
            dataset.append('Meeting_en', this.Meeting_en);
            dataset.append('Meeting_sufix_en', this.Meeting_sufix_en);
            dataset.append('Draft_Resolution_prefix_en', this.Draft_Resolution_prefix_en);
            dataset.append('Draft_Resolution_en', this.Draft_Resolution_en);
            dataset.append('Draft_Resolution_sufix_en', this.Draft_Resolution_sufix_en);
            dataset.append('Title_prefix_en', this.Title_prefix_en);
            dataset.append('Title_en', this.Title_en);
            dataset.append('Title_sufix_en', this.Title_sufix_en);
            dataset.append('date_en', this.date_en);
          }
          // French fields
          else if (this.languageSelected === 'FR') {
            dataset.append('Resolution_prefix_fr', this.Resolution_prefix_fr);
            dataset.append('Resolution_fr', this.Resolution_fr);
            dataset.append('Resolution_sufix_fr', this.Resolution_sufix_fr);
            dataset.append('Plenary_fr', this.Plenary_fr);
            dataset.append('Agenda_numbers_fr', this.Agenda_numbers_fr);
            dataset.append('Meeting_prefix_fr', this.Meeting_prefix_fr);
            dataset.append('Meeting_fr', this.Meeting_fr);
            dataset.append('Meeting_sufix_fr', this.Meeting_sufix_fr);
            dataset.append('Draft_Resolution_prefix_fr', this.Draft_Resolution_prefix_fr);
            dataset.append('Draft_Resolution_fr', this.Draft_Resolution_fr);
            dataset.append('Draft_Resolution_sufix_fr', this.Draft_Resolution_sufix_fr);
            dataset.append('Title_prefix_fr', this.Title_prefix_fr);
            dataset.append('Title_fr', this.Title_fr);
            dataset.append('Title_sufix_fr', this.Title_sufix_fr);
            dataset.append('date_fr', this.date_fr);
          }
          // Spanish fields
          else if (this.languageSelected === 'ES') {
            dataset.append('Resolution_prefix_es', this.Resolution_prefix_es);
            dataset.append('Resolution_es', this.Resolution_es);
            dataset.append('Resolution_sufix_es', this.Resolution_sufix_es);
            dataset.append('Plenary_es', this.Plenary_es);
            dataset.append('Agenda_numbers_es', this.Agenda_numbers_es);
            dataset.append('Meeting_prefix_es', this.Meeting_prefix_es);
            dataset.append('Meeting_es', this.Meeting_es);
            dataset.append('Meeting_sufix_es', this.Meeting_sufix_es);
            dataset.append('Draft_Resolution_prefix_es', this.Draft_Resolution_prefix_es);
            dataset.append('Draft_Resolution_es', this.Draft_Resolution_es);
            dataset.append('Draft_Resolution_sufix_es', this.Draft_Resolution_sufix_es);
            dataset.append('Title_prefix_es', this.Title_prefix_es);
            dataset.append('Title_es', this.Title_es);
            dataset.append('Title_sufix_es', this.Title_sufix_es);
            dataset.append('date_es', this.date_es);
          }
          const my_response = await fetch("./delete_ga_listing", {
            method: "POST",
            body: dataset
          });
          const my_data = await my_response.json();
          this.deleteRecordFromQuery = false;
          showSuccess("Record deleted!!!");
          setTimeout(() => {
          location.reload();
          }, 2000);
        }
      },
      testNotification() {
        console.log('Test notification button clicked');
        showSuccess('Test notification is working!', 'Success', 3000);
        showError('This is an error notification', 'Error', 3000);
        showWarning('This is a warning notification', 'Warning', 3000);
        showInfo('This is an info notification', 'Info', 3000);
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
        const my_response = await fetch("./refresh_data_ga",{
          "method":"POST",
          "body":dataset
          }); 
          const my_data = await my_response.json();  
        showInfo(my_data["message"])
      },
       async refresh_data_ga(){
        let mySession=document.getElementById("session").value
        let myYear=document.getElementById("year").value
        let myMonth=""
        if (document.getElementById("january").checked) myMonth=1
        if (document.getElementById("february").checked) myMonth=2
        if (document.getElementById("march").checked) myMonth=3
        if (document.getElementById("april").checked) myMonth=4
        if (document.getElementById("may").checked) myMonth=5
        if (document.getElementById("june").checked) myMonth=6
        if (document.getElementById("july").checked) myMonth=7
        if (document.getElementById("august").checked) myMonth=8
        if (document.getElementById("september").checked) myMonth=9
        if (document.getElementById("october").checked) myMonth=10
        if (document.getElementById("november").checked) myMonth=11
        if (document.getElementById("december").checked) myMonth=12

        let dataset = new FormData()
        dataset.append('session',mySession)
        dataset.append('year',myYear)
        dataset.append('month',myMonth)
        showInfo("The process has started the data will be updated in few seconds!!!")
        const my_response = await fetch("./refresh_data_ga",{
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
          const my_response = await fetch("./exportjsonga/" + myMeetingValue);
          const my_data = await my_response.json();
          
          my_data.forEach(element => {
            // We find the meeting
            if (element["listing_id"]===myMeetingValue){
                this.listOfRecords.push(element)
              }
            })
          let myFileName="extract_general_assembly_table"+Date.now()+".json"
          this.downloadJsonFile(this.listOfRecords,myFileName) 
      },
      async exportHTML(){
        try {
              let myData=document.getElementById("myTable")
              if (!myData) {
                showError("Table not found. Please make sure the table is displayed first.");
                return;
              }
              
              // Create a copy of the table to avoid modifying the original
              let tableCopy = myData.cloneNode(true);
              
              // Remove the Actions column from all rows except header
              for(const row of tableCopy.rows){
                  if (row.rowIndex!==0) 
                    {
                      row.deleteCell(-1);
                    }
              }
              
              let myDataHTML=tableCopy.outerHTML
              showSuccess("Your data has been exported with HTML format!!!")
              
              let start=`
              <div id="s-lg-content-74877231" class="  clearfix">
              <h4 style="text-align: center;">GA Resolutions Export</h4>
              <link href="//www.un.org/depts/dhl/css/ga-table.css" rel="stylesheet" type="text/css">     
              <p style="text-align: justify;">&nbsp;</p>     
              `
              let end=`
              </div>
              `
              let element = document.createElement('a');
              element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(start + myDataHTML + end));
              element.setAttribute('download', `extract_ga_resolutions_table_${Date.now()}.html`);
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
       
       var toExcel = document.getElementById(tableName).innerHTML;
       var ctx = {
         worksheet: 'GA Resolutions',
         table: toExcel
       };
       var link = document.createElement("a");
       link.download = "ga_resolutions_export.xls";
       link.href = uri + base64(format(template, ctx));
       link.click();
     },
     components: {}
  })

let app_datasetgaresolutions = new Vue({
    el: '#dldatasetgaresolutions'
})

  
  
  