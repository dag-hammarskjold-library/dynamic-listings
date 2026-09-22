const VETO_LINK_COLUMNS = ['draft', 'written_record', 'agenda_item'];
const VETO_PLAIN_COLUMNS = ['date', 'negative_vote'];
const VETO_COLUMN_ORDER = ['date', 'draft', 'written_record', 'agenda_item', 'negative_vote'];

function vetoPerLangFieldNames() {
  const names = [];
  for (const col of VETO_PLAIN_COLUMNS) {
    for (const lang of ['en', 'fr', 'es']) {
      names.push(`${col}_${lang}`);
    }
  }
  for (const col of VETO_LINK_COLUMNS) {
    for (const lang of ['en', 'fr', 'es']) {
      names.push(
        `${col}_prefix_${lang}`,
        `${col}_${lang}`,
        `${col}_sufix_${lang}`,
        `${col}_link_${lang}`,
      );
    }
  }
  return names;
}

const VETO_PER_LANG_FIELD_NAMES = vetoPerLangFieldNames();

function emptyVetoOutcome() {
  const o = { Veto_id: '', sort_date: '' };
  for (const name of VETO_PER_LANG_FIELD_NAMES) {
    o[name] = '';
  }
  return o;
}

function normalizeBreakTags(html) {
  return (html || '').replace(/<\s*br\s*\/?\s*>/gi, '<br>');
}

function composeVetoCell(record, base, lang) {
  if (VETO_PLAIN_COLUMNS.includes(base)) {
    return normalizeBreakTags(record[`${base}_${lang}`] || '');
  }
  const legacy = record[`${base}_${lang}`] || '';
  const link = record[`${base}_link_${lang}`] || '';
  const prefix = record[`${base}_prefix_${lang}`] || '';
  const text = record[`${base}_${lang}`] || '';
  const sufix = record[`${base}_sufix_${lang}`] || '';
  if (legacy && legacy.includes('<') && !link && !prefix && !sufix) {
    return normalizeBreakTags(legacy);
  }
  if (link && text) {
    return normalizeBreakTags(`${prefix}<a target="_top" href="${link}">${text}</a>${sufix}`);
  }
  return normalizeBreakTags(`${prefix}${text || legacy}${sufix}`);
}

function vetoFieldSuffix(languageSelected) {
  if (languageSelected === 'FR') return 'fr';
  if (languageSelected === 'ES') return 'es';
  return 'en';
}

function appendVetoLanguageFields(formData, languageSelected, outcome) {
  const suffix = vetoFieldSuffix(languageSelected);
  for (const name of VETO_PER_LANG_FIELD_NAMES) {
    if (name.endsWith(`_${suffix}`)) {
      formData.append(name, outcome[name] || '');
    }
  }
  formData.append('Veto_id', outcome.Veto_id || '');
  formData.append('sort_date', outcome.sort_date || '');
}

Vue.component('displaylistdatasetvetocomponent', {
  props: ['title', 'prefix'],
  template: `
     <div class="container" style="min-height: 70vh;">
        <div class="alert alert-success" role="alert">
            <h3 class="alert-heading"> Dynamic Listings - {{title}} </h3>
        </div>

        <div class="container-fluid">
            <div v-if="initPage">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="listofvetolistings" class="form-label">Choose listing:</label>
                  <select class="form-select" id="listofvetolistings" name="listofvetolistings">
                    <option v-for="listing in listingsIds" v-bind:value="listing">{{listing}}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="listofvetolanguages" class="form-label">Language:</label>
                  <select class="form-select" id="listofvetolanguages" name="listofvetolanguages">
                    <option value="EN" selected="selected">English</option>
                    <option value="FR">French</option>
                    <option value="ES">Spanish</option>
                  </select>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col">
                  <button type="button" class="btn btn-success me-2" @click="startCreateRecord()">Create new record</button>
                  <button type="button" class="btn btn-primary me-2" @click="displayData('listofvetolistings','listofvetolanguages')">Update the table</button>
                  <button type="button" class="btn btn-secondary me-2" @click="renderData('listofvetolistings','listofvetolanguages')">Display</button>
                  <button type="button" class="btn btn-secondary me-2" @click="exportDataToJson('listofvetolistings')">Full JSON</button>
                  <button type="button" class="btn btn-outline-warning me-2" @click="toggleImportPanel()">Import from HTML</button>
                </div>
              </div>
              <div v-if="showImportPanel" class="row mt-4">
                <div class="col-12">
                  <div class="card border-warning">
                    <div class="card-body">
                      <h5 class="card-title">Import veto table from HTML files</h5>
                      <p class="text-muted small mb-3">
                        Upload the three public table files (English, French, Spanish). Rows are merged by position.
                      </p>
                      <div class="row g-3 mb-3">
                        <div class="col-md-4">
                          <label class="form-label">English (.htm)</label>
                          <input type="file" class="form-control" accept=".htm,.html,text/html" @change="onImportFile('en', $event)">
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">French (.htm)</label>
                          <input type="file" class="form-control" accept=".htm,.html,text/html" @change="onImportFile('fr', $event)">
                        </div>
                        <div class="col-md-4">
                          <label class="form-label">Spanish (.htm)</label>
                          <input type="file" class="form-control" accept=".htm,.html,text/html" @change="onImportFile('es', $event)">
                        </div>
                      </div>
                      <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="vetoImportDryRun" v-model="importDryRun">
                        <label class="form-check-label" for="vetoImportDryRun">Dry run (parse only — do not write to MongoDB)</label>
                      </div>
                      <fieldset class="mb-3">
                        <legend class="form-label fs-6 mb-2">When <strong>Veto_id</strong> already exists for this listing</legend>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="vetoConflictSkip" value="skip" v-model="importOnConflict">
                          <label class="form-check-label" for="vetoConflictSkip">Skip — leave existing record unchanged</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="vetoConflictUpdate" value="update" v-model="importOnConflict">
                          <label class="form-check-label" for="vetoConflictUpdate">Update — replace fields on the existing record</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="vetoConflictDuplicate" value="duplicate" v-model="importOnConflict">
                          <label class="form-check-label" for="vetoConflictDuplicate">Insert duplicate — add a new row (same Veto_id allowed)</label>
                        </div>
                      </fieldset>
                      <button type="button" class="btn btn-warning me-2" :disabled="importInProgress" @click="runImportFromHtml('listofvetolistings')">
                        <span v-if="importInProgress"><i class="fas fa-spinner fa-spin me-1"></i>Importing…</span>
                        <span v-else>Run import</span>
                      </button>
                      <button type="button" class="btn btn-secondary" @click="showImportPanel = false">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div v-if="displayRecordFromQuery" class="mt-4">
          <div class="row mb-3">
            <div class="col">
              <button type="button" class="btn btn-success me-2" @click="exportExcel('myVetoTable')">Extract to Excel</button>
              <button type="button" class="btn btn-secondary me-2" @click="exportHTML()">Extract to HTML</button>
              <button type="button" class="btn btn-primary me-2" @click="document.location.reload(true);">Go Back</button>
            </div>
          </div>

          <table v-if="languageSelected==='EN'" id="myVetoTable" class="tablefont table table-striped">
            <tbody>
              <tr><th colspan="6" class="tbltitle">Veto List (in reverse chronological order)</th></tr>
              <tr>
                <th width="15%">Date</th>
                <th width="15%">Draft</th>
                <th width="20%">Written Record</th>
                <th width="30%">Agenda Item</th>
                <th width="20%">Permanent Member Casting Negative Vote</th>
                <th width="10%">Actions</th>
              </tr>
              <tr v-for="record in listOfRecords" :key="record._id.$oid">
                <td v-html="vetoCell(record, 'date')"></td>
                <td v-html="vetoCell(record, 'draft')"></td>
                <td v-html="vetoCell(record, 'written_record')"></td>
                <td v-html="vetoCell(record, 'agenda_item')"></td>
                <td v-html="vetoCell(record, 'negative_vote')"></td>
                <td>
                  <span class="badge rounded-pill bg-warning" @click="openEdit(record.Veto_id)"><i class="fas fa-pen"></i></span>
                  <span class="badge rounded-pill bg-danger" @click="openDelete(record.Veto_id)"><i class="fas fa-trash-alt"></i></span>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-if="languageSelected==='FR'" id="myVetoTable" class="tablefont table table-striped">
            <tbody>
              <tr><th colspan="6" class="tbltitle">Liste des vetos (ordre chronologique inverse)</th></tr>
              <tr>
                <th width="15%">Date</th>
                <th width="15%">Projet de résolution</th>
                <th width="20%">Procès-verbal</th>
                <th width="30%">Question</th>
                <th width="20%">Membre(s) permanent(s) ayant voté contre</th>
                <th width="10%">Actions</th>
              </tr>
              <tr v-for="record in listOfRecords" :key="record._id.$oid">
                <td v-html="vetoCellFr(record, 'date')"></td>
                <td v-html="vetoCellFr(record, 'draft')"></td>
                <td v-html="vetoCellFr(record, 'written_record')"></td>
                <td v-html="vetoCellFr(record, 'agenda_item')"></td>
                <td v-html="vetoCellFr(record, 'negative_vote')"></td>
                <td>
                  <span class="badge rounded-pill bg-warning" @click="openEdit(record.Veto_id)"><i class="fas fa-pen"></i></span>
                  <span class="badge rounded-pill bg-danger" @click="openDelete(record.Veto_id)"><i class="fas fa-trash-alt"></i></span>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-if="languageSelected==='ES'" id="myVetoTable" class="tablefont table table-striped">
            <tbody>
              <tr><th colspan="6" class="tbltitle">Lista de Veto (orden cronológico inverso)</th></tr>
              <tr>
                <th width="15%">Fecha</th>
                <th width="15%">Proyecto</th>
                <th width="20%">Acta de sesión / Registro escrito</th>
                <th width="30%">Tema</th>
                <th width="20%">Miembros permanentes que votaron en contra</th>
                <th width="10%">Actions</th>
              </tr>
              <tr v-for="record in listOfRecords" :key="record._id.$oid">
                <td v-html="vetoCellEs(record, 'date')"></td>
                <td v-html="vetoCellEs(record, 'draft')"></td>
                <td v-html="vetoCellEs(record, 'written_record')"></td>
                <td v-html="vetoCellEs(record, 'agenda_item')"></td>
                <td v-html="vetoCellEs(record, 'negative_vote')"></td>
                <td>
                  <span class="badge rounded-pill bg-warning" @click="openEdit(record.Veto_id)"><i class="fas fa-pen"></i></span>
                  <span class="badge rounded-pill bg-danger" @click="openDelete(record.Veto_id)"><i class="fas fa-trash-alt"></i></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="updateRecordFromQuery || createRecordFromQuery">
          <h3 class="text-primary"> {{ createRecordFromQuery ? 'Create' : 'Update' }} record ({{ languageSelected }}) </h3>
          <hr>
          <form @submit.prevent="">
            <div v-if="createRecordFromQuery" class="mb-3">
              <label class="form-label">Listing id</label>
              <input type="text" class="form-control" v-model="listing_id">
            </div>
            <div class="mb-3">
              <label class="form-label">Record id (unique key, e.g. primary draft symbol S/2026/273)</label>
              <input type="text" class="form-control" v-model="outcomes[0].Veto_id" :disabled="updateRecordFromQuery">
            </div>
            <div class="mb-3">
              <label class="form-label">Sort date (YYYY-MM-DD, for reverse chronological order)</label>
              <input type="text" class="form-control" v-model="outcomes[0].sort_date" placeholder="2026-04-07">
            </div>

            <div v-if="languageSelected==='EN'" v-for="(outcome, index) in outcomes" :key="'en'+index">
              <p class="text-muted small">Link columns: prefix, link text, URL, and sufix (same pattern as GA Resolutions).</p>
              <div class="mb-2"><label class="form-label">Date</label><input class="form-control" v-model="outcome.date_en"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Draft prefix</label><input class="form-control" v-model="outcome.draft_prefix_en"></div>
              <div class="mb-2"><label class="form-label">Draft (link text)</label><input class="form-control" v-model="outcome.draft_en"></div>
              <div class="mb-2"><label class="form-label">Draft link (URL)</label><input class="form-control" v-model="outcome.draft_link_en"></div>
              <div class="mb-2"><label class="form-label">Draft sufix</label><input class="form-control" v-model="outcome.draft_sufix_en"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Written record prefix</label><input class="form-control" v-model="outcome.written_record_prefix_en"></div>
              <div class="mb-2"><label class="form-label">Written record (link text)</label><input class="form-control" v-model="outcome.written_record_en"></div>
              <div class="mb-2"><label class="form-label">Written record link (URL)</label><input class="form-control" v-model="outcome.written_record_link_en"></div>
              <div class="mb-2"><label class="form-label">Written record sufix</label><input class="form-control" v-model="outcome.written_record_sufix_en"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Agenda item prefix</label><input class="form-control" v-model="outcome.agenda_item_prefix_en"></div>
              <div class="mb-2"><label class="form-label">Agenda item (link text)</label><input class="form-control" v-model="outcome.agenda_item_en"></div>
              <div class="mb-2"><label class="form-label">Agenda item link (URL)</label><input class="form-control" v-model="outcome.agenda_item_link_en"></div>
              <div class="mb-2"><label class="form-label">Agenda item sufix</label><input class="form-control" v-model="outcome.agenda_item_sufix_en"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Permanent member(s) casting negative vote</label><textarea class="form-control" rows="2" v-model="outcome.negative_vote_en"></textarea></div>
            </div>

            <div v-if="languageSelected==='FR'" v-for="(outcome, index) in outcomes" :key="'fr'+index">
              <div class="mb-2"><label class="form-label">Date</label><input class="form-control" v-model="outcome.date_fr"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Projet prefix</label><input class="form-control" v-model="outcome.draft_prefix_fr"></div>
              <div class="mb-2"><label class="form-label">Projet (texte du lien)</label><input class="form-control" v-model="outcome.draft_fr"></div>
              <div class="mb-2"><label class="form-label">Projet lien (URL)</label><input class="form-control" v-model="outcome.draft_link_fr"></div>
              <div class="mb-2"><label class="form-label">Projet sufix</label><input class="form-control" v-model="outcome.draft_sufix_fr"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Procès-verbal prefix</label><input class="form-control" v-model="outcome.written_record_prefix_fr"></div>
              <div class="mb-2"><label class="form-label">Procès-verbal (texte du lien)</label><input class="form-control" v-model="outcome.written_record_fr"></div>
              <div class="mb-2"><label class="form-label">Procès-verbal lien (URL)</label><input class="form-control" v-model="outcome.written_record_link_fr"></div>
              <div class="mb-2"><label class="form-label">Procès-verbal sufix</label><input class="form-control" v-model="outcome.written_record_sufix_fr"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Question prefix</label><input class="form-control" v-model="outcome.agenda_item_prefix_fr"></div>
              <div class="mb-2"><label class="form-label">Question (texte du lien)</label><input class="form-control" v-model="outcome.agenda_item_fr"></div>
              <div class="mb-2"><label class="form-label">Question lien (URL)</label><input class="form-control" v-model="outcome.agenda_item_link_fr"></div>
              <div class="mb-2"><label class="form-label">Question sufix</label><input class="form-control" v-model="outcome.agenda_item_sufix_fr"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Membre(s) permanent(s)</label><textarea class="form-control" rows="2" v-model="outcome.negative_vote_fr"></textarea></div>
            </div>

            <div v-if="languageSelected==='ES'" v-for="(outcome, index) in outcomes" :key="'es'+index">
              <div class="mb-2"><label class="form-label">Fecha</label><input class="form-control" v-model="outcome.date_es"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Proyecto prefix</label><input class="form-control" v-model="outcome.draft_prefix_es"></div>
              <div class="mb-2"><label class="form-label">Proyecto (texto del enlace)</label><input class="form-control" v-model="outcome.draft_es"></div>
              <div class="mb-2"><label class="form-label">Proyecto enlace (URL)</label><input class="form-control" v-model="outcome.draft_link_es"></div>
              <div class="mb-2"><label class="form-label">Proyecto sufix</label><input class="form-control" v-model="outcome.draft_sufix_es"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Acta prefix</label><input class="form-control" v-model="outcome.written_record_prefix_es"></div>
              <div class="mb-2"><label class="form-label">Acta (texto del enlace)</label><input class="form-control" v-model="outcome.written_record_es"></div>
              <div class="mb-2"><label class="form-label">Acta enlace (URL)</label><input class="form-control" v-model="outcome.written_record_link_es"></div>
              <div class="mb-2"><label class="form-label">Acta sufix</label><input class="form-control" v-model="outcome.written_record_sufix_es"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Tema prefix</label><input class="form-control" v-model="outcome.agenda_item_prefix_es"></div>
              <div class="mb-2"><label class="form-label">Tema (texto del enlace)</label><input class="form-control" v-model="outcome.agenda_item_es"></div>
              <div class="mb-2"><label class="form-label">Tema enlace (URL)</label><input class="form-control" v-model="outcome.agenda_item_link_es"></div>
              <div class="mb-2"><label class="form-label">Tema sufix</label><input class="form-control" v-model="outcome.agenda_item_sufix_es"></div>
              <hr>
              <div class="mb-2"><label class="form-label">Miembros permanentes</label><textarea class="form-control" rows="2" v-model="outcome.negative_vote_es"></textarea></div>
            </div>

            <hr>
            <button v-if="updateRecordFromQuery" type="submit" class="btn btn-primary me-2" @click="updateRecord()">Update record</button>
            <button v-if="createRecordFromQuery" type="submit" class="btn btn-primary me-2" @click="createRecord()">Create record</button>
            <button type="button" class="btn btn-secondary" @click="location.reload()">Back</button>
          </form>
        </div>

        <div v-if="deleteRecordFromQuery">
          <h3 class="text-danger">Confirm deletion ({{ languageSelected }})</h3>
          <p>Record: <strong>{{ outcomes[0] && outcomes[0].Veto_id }}</strong></p>
          <button class="btn btn-danger me-2" @click="deleteRecord()">Delete</button>
          <button class="btn btn-secondary" @click="location.reload()">Cancel</button>
        </div>
     </div>`,

  data() {
    return {
      initPage: true,
      listingsIds: [],
      languageSelected: 'EN',
      displayRecordFromQuery: false,
      updateRecordFromQuery: false,
      createRecordFromQuery: false,
      deleteRecordFromQuery: false,
      listOfRecords: [],
      listing_id: '',
      my_id: '',
      outcomes: [emptyVetoOutcome()],
      defaultListingId: 'sc_veto_list',
      showImportPanel: false,
      importDryRun: false,
      importOnConflict: 'skip',
      importInProgress: false,
      importFiles: { en: null, fr: null, es: null },
    };
  },

  created: async function () {
    try {
      const my_response = await fetch('./getvetolistingsId');
      if (!my_response.ok) {
        showError(`Could not load veto listings (HTTP ${my_response.status}).`);
        this.listingsIds.push(this.defaultListingId);
        return;
      }
      const my_data = await my_response.json();
      my_data.forEach((element) => this.listingsIds.push(element));
      if (this.listingsIds.length === 0) {
        this.listingsIds.push(this.defaultListingId);
      }
    } catch (error) {
      showError('Could not load veto listings: ' + error.message);
      this.listingsIds.push(this.defaultListingId);
    }
  },

  methods: {
    vetoCell(record, col) {
      return composeVetoCell(record, col, 'en');
    },
    vetoCellFr(record, col) {
      return composeVetoCell(record, col, 'fr');
    },
    vetoCellEs(record, col) {
      return composeVetoCell(record, col, 'es');
    },

    toggleImportPanel() {
      this.showImportPanel = !this.showImportPanel;
      if (!this.showImportPanel) {
        this.importFiles = { en: null, fr: null, es: null };
        this.importDryRun = false;
        this.importOnConflict = 'skip';
      }
    },

    onImportFile(lang, event) {
      const file = event.target.files && event.target.files[0];
      this.importFiles[lang] = file || null;
    },

    async runImportFromHtml(listingSelect) {
      const listingEl = document.getElementById(listingSelect);
      const listingId = listingEl ? listingEl.value : this.defaultListingId;
      if (!this.importFiles.en || !this.importFiles.fr || !this.importFiles.es) {
        showError('Select all three HTML files (EN, FR, ES) before importing.');
        return;
      }
      const formData = new FormData();
      formData.append('listing_id', listingId);
      formData.append('en', this.importFiles.en);
      formData.append('fr', this.importFiles.fr);
      formData.append('es', this.importFiles.es);
      if (this.importDryRun) formData.append('dry_run', '1');
      formData.append('on_conflict', this.importOnConflict || 'skip');

      this.importInProgress = true;
      try {
        const response = await fetch('./import_veto_from_html', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) {
          showError(data.message || 'Import failed.');
          return;
        }
        showSuccess(data.message || 'Import finished.');
        if (!this.importDryRun && !data.dry_run) {
          this.showImportPanel = false;
        }
      } catch (err) {
        showError('Import failed: ' + err.message);
      } finally {
        this.importInProgress = false;
      }
    },

    renderData(listingSelect, languageSelect) {
      const listing = document.getElementById(listingSelect).value;
      const language = document.getElementById(languageSelect).value;
      const base = window.location.toString().replace('/datasetSCVeto', '');
      window.open(`${base}/render_meeting_veto/${listing}/${language}`, '_blank').focus();
    },

    async displayData(listingSelect, languageSelect) {
      const listingEl = document.getElementById(listingSelect);
      const languageEl = document.getElementById(languageSelect);
      if (!listingEl || !languageEl) {
        showError('Selectors not found.');
        return;
      }
      this.listing_id = listingEl.value;
      this.languageSelected = languageEl.value;
      this.initPage = false;
      this.listOfRecords = [];

      const response = await fetch('./getvetolistings/' + encodeURIComponent(this.listing_id));
      if (!response.ok) {
        showError(`Could not load records (HTTP ${response.status}).`);
        return;
      }
      const data = await response.json();
      data.forEach((row) => this.listOfRecords.push(row));
      this.displayRecordFromQuery = true;
    },

    startCreateRecord() {
      const languageEl = document.getElementById('listofvetolanguages');
      const listingEl = document.getElementById('listofvetolistings');
      this.languageSelected = languageEl ? languageEl.value : 'EN';
      this.listing_id = listingEl ? listingEl.value : this.defaultListingId;
      this.initPage = false;
      this.displayRecordFromQuery = false;
      this.updateRecordFromQuery = false;
      this.deleteRecordFromQuery = false;
      this.createRecordFromQuery = true;
      this.outcomes = [emptyVetoOutcome()];
    },

    openEdit(vetoId) {
      this.openRecord(vetoId);
      this.displayRecordFromQuery = false;
      this.updateRecordFromQuery = true;
      this.createRecordFromQuery = false;
      this.deleteRecordFromQuery = false;
      this.initPage = false;
    },

    openDelete(vetoId) {
      this.openRecord(vetoId);
      this.displayRecordFromQuery = false;
      this.deleteRecordFromQuery = true;
      this.updateRecordFromQuery = false;
      this.createRecordFromQuery = false;
      this.initPage = false;
    },

    openRecord(vetoId) {
      this.outcomes = [];
      this.listOfRecords.forEach((element) => {
        if (element.Veto_id === vetoId) {
          this.my_id = element._id.$oid;
          this.listing_id = element.listing_id;
          this.outcomes.push({ ...emptyVetoOutcome(), ...element });
        }
      });
      if (!this.outcomes.length) {
        showError('Record not found in current table.');
      }
    },

    async createRecord() {
      if (!this.outcomes.length) return;
      if (!this.outcomes[0].Veto_id) {
        showError('Record id (Veto_id) is required.');
        return;
      }
      if (!this.listing_id) {
        showError('Listing id is required.');
        return;
      }
      const formData = new FormData();
      formData.append('listing_id', this.listing_id);
      formData.append('languageSelected', this.languageSelected);
      appendVetoLanguageFields(formData, this.languageSelected, this.outcomes[0]);

      const response = await fetch('./create_veto_listing', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        showError(data.message || 'Create failed.');
        return;
      }
      showSuccess(data.message || 'Record created.');
      setTimeout(() => location.reload(), 1500);
    },

    async updateRecord() {
      if (!this.my_id) {
        showError('No record selected.');
        return;
      }
      const formData = new FormData();
      formData.append('_id', this.my_id);
      formData.append('listing_id', this.listing_id);
      formData.append('languageSelected', this.languageSelected);
      appendVetoLanguageFields(formData, this.languageSelected, this.outcomes[0]);

      const response = await fetch('./update_veto_listing', { method: 'PUT', body: formData });
      const data = await response.json();
      if (!response.ok) {
        showError(data.message || 'Update failed.');
        return;
      }
      showSuccess(data.message || 'Record updated.');
      setTimeout(() => location.reload(), 1500);
    },

    async deleteRecord() {
      if (!this.my_id) return;
      const formData = new FormData();
      formData.append('_id', this.my_id);
      const response = await fetch('./delete_veto_listing', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        showError(data.message || 'Delete failed.');
        return;
      }
      showSuccess(data.message || 'Record deleted.');
      setTimeout(() => location.reload(), 1500);
    },

    async exportDataToJson(listingSelect) {
      const listing = document.getElementById(listingSelect).value;
      const response = await fetch('./exportjsonveto/' + encodeURIComponent(listing));
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sc_veto_' + listing + '_' + Date.now() + '.json';
      a.click();
      a.remove();
    },

    exportHTML() {
      const table = document.getElementById('myVetoTable');
      if (!table) {
        showError('Table not found.');
        return;
      }
      const copy = table.cloneNode(true);
      for (const row of copy.rows) {
        if (row.cells.length > 0) row.deleteCell(-1);
      }
      const intro = {
        EN: '<tr><th colspan="5" class="tbltitle">Veto List<br>(in reverse chronological order)</th></tr>',
        FR: '<tr><th colspan="5" class="tbltitle">Liste des vetos<br>(ordre chronologique inverse)</th></tr>',
        ES: '<tr><th colspan="5" class="tbltitle">Lista de Veto<br>(clasificados por orden cronológico inverso)</th></tr>',
      }[this.languageSelected] || '';

      const start = `<html><link href="//www.un.org/depts/dhl/css/ga-table.css" rel="stylesheet" type="text/css" /><table class="tablefont">${intro}`;
      const end = '</table></html>';
      const html = start + copy.innerHTML.replace(/<tbody>|<\/tbody>/g, '') + end;
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
      element.setAttribute('download', 'scact_veto_table_' + this.languageSelected.toLowerCase() + '_' + Date.now() + '.htm');
      element.click();
      showSuccess('HTML exported.');
    },

    exportExcel(tableName) {
      const tableElement = document.getElementById(tableName);
      if (!tableElement) {
        showError('Table not found.');
        return;
      }
      const uri = 'data:application/vnd.ms-excel;base64,';
      const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head></head><body><table>{table}</table></body></html>';
      const base64 = (s) => window.btoa(unescape(encodeURIComponent(s)));
      const format = (s, c) => s.replace(/{(\w+)}/g, (m, p) => c[p]);
      const copy = tableElement.cloneNode(true);
      for (const row of copy.rows) {
        if (row.cells.length > 0) row.deleteCell(-1);
      }
      const link = document.createElement('a');
      link.download = 'sc_veto_export_' + Date.now() + '.xls';
      link.href = uri + base64(format(template, { table: copy.outerHTML }));
      link.click();
      showSuccess('Excel exported.');
    },
  },
});

new Vue({ el: '#dldatasetveto' });
