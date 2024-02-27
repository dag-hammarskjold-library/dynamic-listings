Vue.component('index', {
    template: `
                <div class="alert alert-secondary" role="alert">
                    <h2 class="alert-heading"> Dynamic Listings  </h2>
                <hr>
                <p>request for data : https://metadata.un.org/editor/api/marc/bibs/records/753214/fields/989/0<p/>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore <p/>
                <p>et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip <p/>
                <p>ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu <p/>
                <p>fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt <p/>
                <p>mollit anim id est laborum.</p>
                </div>
                 `
  })
  
let app_index = new Vue({
  el: '#dl'
})