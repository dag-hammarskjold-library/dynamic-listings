Vue.component('test',{
    props: ["title"],
    template: `
    <div class="page mt-3">
          <div class="alert alert-success" role="alert">
              <h2 class="alert-heading"> Dynamic Listings - {{title}} </h2>
          </div>

          <div>
            <button @click="addRow">Add Row</button>
            <div v-for="(row, index) in rows" :key="index" class="row">
              <div class="cell" v-for="(cell, cellIndex) in row" :key="cellIndex">
                <input v-model="cell.value" placeholder="Enter value" />
              </div>
              <button @click="removeRow(index)">Remove Row</button>
            </div>
          </div>
  </div>`,
    data: function () {
      return {
        rows: [
          [{ value1: "" }, { value2: "" }, { value3: "" },{ value4: "" }, { value5: "" }],
        ]
      }
    },
    created:async function(){
    } 
    ,
    methods:{
      addRow() {
        // Adds a new row with three empty cells
        this.rows.push([{ value1: "" }, { value2: "" }, { value3: "" }, { value4: "" }, { value5: "" }]);
      },
      removeRow(index) {
        // Removes a row at the specified index
        this.rows.splice(index, 1);
      }
    },
    components: {}
  }
  )
  
    
  let app_test = new Vue({
    el: '#dltest'
    })
  
  
  
  