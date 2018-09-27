// ============================================
// This module handles the login according to
// the data that is presented.
// ============================================

module.exports = function(){
    this.data;

    this.findUserLogin = function(username, password){
        console.log("IN FINDUSERLOGIN", this.data);
        let match = false;
        let users = data.users;
        for(let i = 0; i < users.length; i++){
            if(users[i].username == username){
                if(users[i].password == password){
                    match = users[i];
                }else{
                    console.log("wrong password");
                }
                
            }
        }
        return match;
    }

    this.findUser = function(username){
        let match = false;
        let users = data;
        for(let i = 0; i < users.length; i++){
            if(users[i].username == username){
                match = users[i];
            }
        }
        return match;
    }

    this.setUserData = function(data){
        this.data = data;
    }

    return this;
}