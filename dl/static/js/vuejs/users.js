Vue.component('displaylistuserscomponent',{
    props: ["title"],
    template: `
  <div class="mt-3">
        
        <!-- Button export / Creation -->
        <div class="mb-3">
          <div class="row">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" v-model="nameFilter" placeholder="Filter by user name...">
              </div>
            </div>
            <div class="col-md-6">
              <button type="button" class="btn btn-success" @click="exportToExcel" v-if="showList"><i class="far fa-file-excel"></i> Extract to Excel</button>
              <button type="button" class="btn btn-primary" @click="showList=false;ShowCreateUser=true;" v-if="showList"><i class="fas fa-plus"></i> Create a new User</button>
            </div>
          </div>
        </div>
        <div class="shadow">
            <!-- Messages -->
            <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
              <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </symbol>
              <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </symbol>
              <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </symbol>
            </svg>

            <!-- Button export / Creation -->
            <table class="table table-striped tableau" id="listlogs" v-if="showList">
            <thead>
              <tr>
                <th scope="col">User ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in filteredFields">
                <td> {{field._id.$oid}} </td>
                <td> {{field.name}} </td>
                <td> {{field.email}}</td>
                <td> {{field.role}}</td>
                <td><span class="badge rounded-pill bg-success mr-2"  @click="showList=false;userToUpdate=field._id.$oid;name=field.name;email=field.email;role=field.role;ShowUpdateUser=true;"><i class="fas fa-sync"></i>   Update</span><span class="badge rounded-pill bg-danger" @click="deleteUser(field._id.$oid, field.name)"><i class="fas fa-trash"></i>  Delete</span></td>
                <td></td>
              </tr>
            </tbody>
            </table>       
        </div>

        <!-- User Creation Form -->
        <div v-if="ShowCreateUser">
            <hr> 
            <form @submit.prevent="">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name" autocomplete="off">
            </div>
            <div class="mb-3">
                <label for="inputEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email"  v-model="email" autocomplete="off">
            </div>
            <div class="mb-3">
                <label for="inputPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password"  v-model="password" autocomplete="off">
            </div>
            <div class="mb-3">
            <label for="role">Choose a role:</label>
                <select name="role" id="role"  v-model="role" autocomplete="off">
                <option value="admin"  selected>Administrator</option>
                <option value="readandwrite" >Read and Write</option>
                <option value="reader" >Read only</option>
                </select> 
            </div>          
            <hr>      
            <button type="submit" class="btn btn-primary" @click="createUser()"> Save your record </button>
            <button class="btn btn-primary" @click="showList=true;ShowCreateUser=false;location.reload()">Back to the list of users </button>
            </form>
        </div>

        <!-- User Update Form -->
        <div v-if="ShowUpdateUser">
            <hr> 
            <form @submit.prevent="updateUser">
            <div class="mb-3">
                <label for="inputName" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" name="name" v-model="name">
            </div>
            <div class="mb-3">
                <label for="inputEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email"  v-model="email">
            </div>
            <div class="mb-3">
            <label for="role">Choose a role:</label>
                <select name="role" id="role"  v-model="role">
                <option value="admin"  selected>Administrator</option>
                <option value="readandwrite" >Read and Write</option>
                <option value="reader" >Read only</option>
                </select> 
            </div>          
            <hr>      
            <button type="submit" class="btn btn-primary"> Update your record </button>
            <button class="btn btn-primary" @click="showList=true;ShowUpdateUser=false;location.reload()">Back to the list of users </button>
            </form>
        </div>

</div>`,
    data: function () {
      return {
        listOfFields:[],
        nameFilter: '',
        showList:true,
        showModal:false,
        ShowCreateUser:false,
        ShowUpdateUser:false,
        name:"",
        email:"",
        password:"",
        role:"",
        userToUpdate:"",

      }
    },
    computed: {
      filteredFields() {
        if (!this.nameFilter) {
          return this.listOfFields;
        }
        return this.listOfFields.filter(field => 
          field.name.toLowerCase().includes(this.nameFilter.toLowerCase())
        );
      }
    },
    created:async function(){
      try {
        const my_response = await fetch("./usersVue");
        const my_data = await my_response.json();
        my_data.forEach(element => {
          this.listOfFields.push(element)
        });
      } catch (error) {
        showError(error.message)
      }
    } 
    ,
    methods:{
      async createUser(){
        try {

            let user = new FormData()
            user.append('name',this.name)
            user.append('email',this.email)
            user.append('password',this.password)
            user.append('role',this.role)
            const my_response = await fetch("./usersVue/AddUser", {
              "method":"POST",
              "body":user
            });
            // const my_data = await my_response.json();
            const my_data = await my_response.json();
            showInfo(my_data["message"])
          } catch (error) {
          showError(error.message)
        }
      },
      async updateUser(){
        try {
            let user = new FormData()
            user.append('name',this.name)
            user.append('email',this.email)
            user.append('_id',this.userToUpdate)
            user.append('role',this.role)
            const my_response = await fetch("./usersVue/UpdateUser/" + this.userToUpdate , {
              "method":"PUT",
              "body":user
            });
          showSuccess(`User ${this.userToUpdate} updated!!!`)
          setTimeout(() => {
            location.reload();
          }, 2000);
          } catch (error) {
          showError(error.message)
        }
      },
      async deleteUser(userID, userName){
          try {
              console.log('deleteUser called with userID:', userID, 'userName:', userName);
              let that=this
              // Show confirmation notification
              this.showDeleteConfirmation(userID, userName);
            } catch (error) {
            showError(error.message)
          }
      },
      showDeleteConfirmation(userID, userName) {
        console.log('showDeleteConfirmation called with userID:', userID, 'userName:', userName);
        
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
              Delete user: <strong>${userName}</strong>?
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 0px;">
            <button id="confirmDeleteBtn" style="
              background: #dc3545 !important;
              color: white !important;
              border: none !important;
              padding: 6px 12px !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              font-size: 12px !important;
              display: flex !important;
              align-items: center !important;
              gap: 3px !important;
            ">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button id="cancelDeleteBtn" style="
              background: #6c757d !important;
              color: white !important;
              border: none !important;
              padding: 6px 12px !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              font-size: 12px !important;
              display: flex !important;
              align-items: center !important;
              gap: 3px !important;
            ">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        console.log('Modal added to DOM');
        
        // Add event listeners
        document.getElementById('confirmDeleteBtn').onclick = () => {
          modal.remove();
          this.confirmDeleteUser(userID, userName);
        };
        
        document.getElementById('cancelDeleteBtn').onclick = () => {
          modal.remove();
        };
        
        modal.onclick = (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        };
      },
      async confirmDeleteUser(userID, userName) {
        try {
              let user = new FormData()
          user.append('_id', userID)
              const my_response = await fetch("./usersVue/DeleteUser", {
                "method":"POST",
                "body":user
              });
          
          // Check if response is ok
          if (!my_response.ok) {
            throw new Error(`Server error: ${my_response.status} ${my_response.statusText}`);
          }
          
          // Check if response is JSON
          const contentType = my_response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await my_response.text();
            throw new Error(`Server returned HTML instead of JSON: ${text.substring(0, 100)}...`);
          }
          
              const my_data = await my_response.json();              
          showSuccess(`User ${userName} has been deleted!!!`)
          setTimeout(() => {
            location.reload();
          }, 2000);
            } catch (error) {
          console.error('Delete user error:', error);
          showError(`Failed to delete user: ${error.message}`)
          }
      },      
      exportToExcel() {
          // Variable to store the final csv data
          let csv_data = [];
       
          // Get each row data from the users table
          let table = document.getElementById('listlogs');
          let rows = table.querySelectorAll('tr');
          
          for (let i = 0; i < rows.length; i++) {
              // Get each column data
              let cols = rows[i].querySelectorAll('td,th');
       
              // Skip the Actions column (5th column, index 4) and the empty column (6th column, index 5)
              let csvrow = [];
              for (let j = 0; j < 4; j++) {
                  if (cols[j]) {
                      // Get the text content only, stripping HTML tags
                      let cellText = cols[j].textContent || cols[j].innerText || '';
                      // Clean up any extra whitespace
                      cellText = cellText.trim().replace(/\s+/g, ' ');
                      csvrow.push(cellText);
                  }
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
  
    
  let app_users = new Vue({
    el: '#dlusers'
    })
  
  
  
  