var login = {
    
    initialize : function()
    {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('home_button').click(function(){
            window.location.href = 'login.html';
        });
        utils.logout();
        
        $('#forgottenPasswordDiv').click(function(){
//             window.open('https://test.versantrn.org/Web/login.aspx?rec=1', '_blank', 'location=yes');
             window.open('https://test.versantrn.org/Web/login.aspx?rec=1', '_system');
             return false;
        });
        $('#sendCredentialsDiv').click(this.authorize);
        
        utils.loadLoginFacilities();
    },
    
    onDeviceReady: function(){
//        navigator.splashscreen.show();
//        setTimeout(function() {
//                   navigator.splashscreen.hide();
//                   }, 2000);
    },
    
    authorize : function ()
    {
        var userName = $('#username').val();
        var password = $('#password').val();
        var facilityId = $('#selectHospitalDiv').attr('data-hospitalId');
        
        var authorizeObject = {'FacilityId' : facilityId, 'UserName' : userName, 'Password' : password};
        
        var authorizeUrl = utils.baseServiceAddress() + 'users/authenticate';
        
        var loginSuccesseded = false;
        $.ajax({
               type: 'post',
               dataType: 'json',
               async: false,
               url: authorizeUrl,
               data: JSON.stringify(authorizeObject),
               contentType: 'application/json; charset=utf-8',
               success: function(data){
               
                if(data.hasOwnProperty('Token') && data.Successeded === true){
                 var token = data.Token;
				 var userFullName = data.UserFullName;
				 
				 var authorizationCookie = {};
				 
				 authorizationCookie['Token'] = token;
				 authorizationCookie['UserFullName'] = userFullName; 
				 
                 localStorage.setItem('AuthorizationCookie', JSON.stringify(authorizationCookie));
                  $.fn.jAlert({'message' : 'Wrong username , password or facility !', 'btn' : [{'label':'OK', 'closeOnClick': true, 'cssClass': 'small_pop_up_button'}], 'size': 'medium', 'cssClass': 'warning_message_small'});

                loginSuccesseded = true;
               
                }
               else{
//                alert(data.responseText);
                $.fn.jAlert({'message' : data.responseText, 'btn' : [{'label':'OK', 'closeOnClick': true, 'cssClass': 'small_pop_up_button'}], 'size': 'medium', 'cssClass': 'warning_message_small'});

               }
               
               
               },
               error: function(data){
                   $.fn.jAlert({'message' : 'Wrong username , password or facility !', 'btn' : [{'label':'OK', 'closeOnClick': true, 'cssClass': 'small_pop_up_button'}], 'size': 'medium', 'cssClass': 'warning_message_small'});
//               alert('Wrong username , password or facility !')
//                alert(data.responseText);
               }});
        
            if(loginSuccesseded){
               //this.navigateToAvailableMetrics();
               window.location.href = 'metrics_available.html';
            }
    },
    
    navigateToAvailableMetrics : function () {
        window.location.href = 'metrics_available.html';
    }
}