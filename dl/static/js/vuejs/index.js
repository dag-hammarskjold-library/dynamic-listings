Vue.component('index', {
    template: `
                <div class="alert alert-secondary shadow" role="alert">
                    <h2 class="alert-heading"> Dynamic Listings  </h2>
                    <hr>
                    <span>
                    Dynamic Listing (DL) application will interface with the DHL Central <br>
                    Database (CDB) to generate and display HTML tables containing <br>
                    The DL application will dynamically update the listings as new data becomes available.<br>
                    It will feature an HTML table representation of the data, and once the DL structure,<br>
                    including data value rules and properties, is configured, it will automatically pull <br>
                    each row data from the database in real-time.Given that not all data values will <br>
                    always be available within the CDB at the time of a DL entry, the system must provide functionality<br>
                    for manual data entry via a web form.<br>
                    </span>
                    
                </div>
                 `
  })
  
let app_index = new Vue({
  el: '#dl'
})