var utils = {
	
	redirectOnError: function(){
		 $.fn.jAlert({'message' : 'Sorry!Something went wrong!', 'btn' : [{'label':'OK', 'closeOnClick': true, 'cssClass': 'small_pop_up_button'}], 'size': 'medium', 'cssClass': 'warning_message_small'});
		this.logout();
	},
	
	logout: function(){
		var authorizationCookie = localStorage.getItem('AuthorizationCookie');
		
		if (authorizationCookie === undefined || authorizationCookie === null || authorizationCookie === ""){
			return;
		}
		else{
            
            utils.resetState();
			localStorage.removeItem('AuthorizationCookie');
 
            
            window.location.href = 'login.html';
			return;
		}
	},
    
    resetState: function(){
        localStorage.removeItem('StateArray');
        localStorage.removeItem('CurrentStateIndex');
    },
	 
    getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        
        return vars;
    },
    
    getAuthorizationCookie: function(){
        var authorizationCookie = JSON.parse(localStorage.getItem('AuthorizationCookie'));
        
        if(authorizationCookie === null || authorizationCookie === ""){
            window.location.href = 'login.html';
        }
        
        return authorizationCookie;
    },
    
    setUserData: function () {
        var authorizationCookie = JSON.parse(localStorage.getItem('AuthorizationCookie'));
        var userFullName = authorizationCookie.UserFullName;
        
        $('#userFullNameDiv').html(userFullName);
        
    },
    
    setExpirationDate: function (expirationDateString){
        var expirationDate = moment(expirationDateString);

        $('#expirationDateMonthDiv').html(expirationDate.format("MMM"));
        $('#expirationDateDayDiv').html(expirationDate.format("D"));
        $('#expirationDateTimeDiv').html(expirationDate.format("hh:mmA"));

    },
    
    setCurrentDate: function (){
        var currentDateObject = new Date();
        var currentDate = moment(currentDateObject);

        var year = currentDate.format("YYYY");
        var month = currentDate.format("MMM").toLocaleUpperCase();
        var day = currentDate.format("D");

        $('#currentDateYearDiv').html(year);
        $('#currentDateMonthDiv').html(month);
        $('#currentDateDayDiv').html(day);
    },

	
    baseServiceAddress: function () {
        // Original method
        //return 'https://atest.versantrn.org/mobileapi/api/';
        return 'http://localhost:61008/api/';
	},
    
    
    loadLoginFacilities: function(){
        
        this.getLoginFacilities();
    
        var mostRecentFacility = localStorage.getItem('MostRecentFacility');
        
        if(mostRecentFacility != null && mostRecentFacility != 'null' && mostRecentFacility != undefined){
            mostRecentFacility = JSON.parse(mostRecentFacility);
            var facilityName = mostRecentFacility.FacilityName;
            var facilityId = mostRecentFacility.FacilityID;
            
            $('#selectHospitalDiv').html(facilityName);
            $('#selectHospitalDiv').attr('data-hospitalId', facilityId);
            
        }
        
        $('#selectHospitalDiv').click(function (e) {
                                      $('#hospitalDiv').show();
                                      });
    
        $('#hospitalDiv > div').click(function (e) {
                                      $('#selectHospitalDiv').html($(this).html());
                                      $('#selectHospitalDiv').attr('data-hospitalId', $(this).attr('data-hospitalId'));
                                      var mostRecentFacility = {'FacilityName': $(this).html(), 'FacilityID': $(this).attr('data-hospitalId')};
                                      
                                      localStorage.removeItem('MostRecentFacility');
                                      localStorage.setItem('MostRecentFacility', JSON.stringify(mostRecentFacility));
                                      $('#hospitalDiv').hide();
                                      });
    },
    
    getLoginFacilities : function()
    {
        var facilitiesURL =  this.baseServiceAddress() + 'users/facilities';
        
        $.ajax({
               type: 'get',
               dataType: 'json',
               url: facilitiesURL,
               async: false,
               timeout:900000,
               success: function (data){
               
               if(data == undefined || data.length == 0){
                   return;
               }
               
               var firstHospitalObject = data[0];
               $('#selectHospitalDiv').html(firstHospitalObject.Name);
               $('#selectHospitalDiv').attr('data-hospitalId', firstHospitalObject.ID);
               
               var n = data.length;
               for(var i = 0; i < data.length; ++i){
                   var hospitalObject = data[i];
               
               $('#hospitalDiv').append($('<div data-hospitalId="' + hospitalObject.ID +'" class="combo-item">' + hospitalObject.Name + '</div>'));
               }
               
               $('#hospitalDiv div').click( function (e) {
                                           $('#selectHospitalDiv').html($(this).html());
                                           $('#selectHospitalDiv').attr('data-hospitalId', $(this).attr('data-hospitalId'));
                                           $('#hospitalDiv').hide();
                                           });
               },
               error: function (data){
                   alert('Sorry!Something went wrong!')
                   this.logout();
               }
           });
    },
    
    addNextState: function(){
        
        var currentStateIndex = parseInt(localStorage.getItem('CurrentStateIndex'));
        var stateArray = JSON.parse(localStorage.getItem('StateArray'));
        
        if(stateArray != null){
            if(currentStateIndex <= 0){
                $('#navigate_backward').attr('src', 'img/hdr_back_disabled.png');
            }
            else{
                $('#navigate_backward').attr('src', 'img/hdr_back.png');
            }
            
            if(currentStateIndex >= (stateArray.length - 1)){
                $('#navigate_forward').attr('src', 'img/hdr_forward_disabled.png');
            }
            else{
                $('#navigate_forward').attr('src', 'img/hdr_forward.png');
            }

        }
        
        
        
        var navigate = utils.getUrlVars()['navigate'];
        if(navigate !== undefined && navigate !== null && navigate !== ''){
            return;
        }
        
        this.removeStatesFromCurrentIndex();
        
        $('#navigate_forward').attr('src', 'img/hdr_forward_disabled.png');

        
        var stateArray = JSON.parse(localStorage.getItem('StateArray'));
        
        if(stateArray === null || stateArray === undefined || stateArray === ''){
            stateArray = new Array();
            currentStateIndex = -1;
        }
        
        if(currentStateIndex > -1){
            if(stateArray[currentStateIndex] === window.location.href){
                return;
            }
        }
        stateArray.push(window.location.href);
        
        localStorage['StateArray'] = JSON.stringify(stateArray);
        localStorage['CurrentStateIndex'] = (currentStateIndex + 1);
        
        $('#navigate_backward').attr('src', 'img/hdr_back.png');
    },
    
    removeStatesFromCurrentIndex: function(){
        var currentStateIndex = parseInt(localStorage.getItem('CurrentStateIndex'));
        
        if(currentStateIndex === undefined || currentStateIndex === null || currentStateIndex === -1 || currentStateIndex === ''){
            return;
        }
        
        var stateArray = JSON.parse(localStorage.getItem('StateArray'));
        
        if(stateArray === null || stateArray === undefined || stateArray === ''){
            return;
        }
        
        if(stateArray.length === 0){
            return;
        }
        
        if(stateArray.length <= currentStateIndex + 1){
            return;
        }
        
        stateArray.splice(currentStateIndex + 1, stateArray.length - (currentStateIndex + 1));
        
        localStorage['StateArray'] = JSON.stringify(stateArray);

    },
    
    navigateBackward: function(){
        var currentStateIndex = parseInt(localStorage.getItem('CurrentStateIndex'));
        
        if(currentStateIndex === undefined || currentStateIndex === null || currentStateIndex === 0 || currentStateIndex === ''){
            return;
        }
        
        var stateArray = JSON.parse(localStorage.getItem('StateArray'));
        
        if(stateArray === null || stateArray === undefined || stateArray === ''){
            return;
        }
        
        if(stateArray.length === 0){
            return;
        }

        
        currentStateIndex = currentStateIndex - 1;
        localStorage.setItem('CurrentStateIndex', currentStateIndex);
        if(stateArray[currentStateIndex].indexOf('?') != -1){
            window.location.href = stateArray[currentStateIndex] + '&navigate=backward';
        }
        else
        {
            window.location.href = stateArray[currentStateIndex] + '?navigate=backward';
        }

    },
    
    navigateForward: function(){
        var currentStateIndex = parseInt(localStorage.getItem('CurrentStateIndex'));
        
        if(currentStateIndex === undefined || currentStateIndex === null || currentStateIndex === -1 || currentStateIndex === ''){
            return;
        }
        
        var stateArray = JSON.parse(localStorage.getItem('StateArray'));
        
        if(stateArray === null || stateArray === undefined || stateArray === ''){
            return;
        }
        
        if(stateArray.length === 0){
            return;
        }
        
        var stateLength = stateArray.length;
        if(currentStateIndex >= (stateLength - 1)){
            return;
        }
        
        currentStateIndex = currentStateIndex + 1;
        localStorage.setItem('CurrentStateIndex', currentStateIndex);

        if(stateArray[currentStateIndex].indexOf('?') != -1){
            window.location.href = stateArray[currentStateIndex] + '&navigate=forward';
        }
        else
        {
            window.location.href = stateArray[currentStateIndex] + '?navigate=forward';
        }

    },
    
    setNavigation: function(){
        $('#navigate_forward').click(utils.navigateForward);
        $('#navigate_backward').click(utils.navigateBackward);
    }
}