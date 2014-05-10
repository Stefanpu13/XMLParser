var forgotten_password = {
	initialize: function(){
        $('#home_button').click(function(){                
               window.location.href = 'login.html';
         });
        
        $('#sendCredentialsDiv').click(this.sendNewCredentials);
        
         utils.loadLoginFacilities();
	},
    
    hideValidationMessages: function(){
        
        $('#userNameEmptyDiv').hide();
        $('#newPasswordEmptyDiv').hide();
        $('#confirmedNewPasswordEmptyDiv').hide();
        
        $('#passwordMisMatchDiv').hide();
        $('#userNameNotValidDiv').hide();
        $('#newPasswordInvalidCharactersDiv').hide();
    },
    
    sendNewCredentials: function(){
        var userName = $('#userName').val();
        
        if(userName === ''){
            $('#userNameEmpty').show();
            return;
        }
        
        
        var newPassword = $('#newPassword').val();
        
        if(newPassword === ''){
            $('#newPasswordEmpty').show();
            return;
        }
        
        if(confirmnedPassword === ''){
            $('#confirmedNewPasswordEmpty').show();
            return;
        }
        
        var confirmnedPassword = $('#confirmedNewPassword').val();
        
        
        
        if(newPassword !== confirmnedpassword){
            $('#passwordMisMatchDiv').show();
        }
    }
}