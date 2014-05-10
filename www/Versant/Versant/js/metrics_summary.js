
var metrics_summary = new function() {

    this.initialize = function (){
         $('#logoutButton').click(utils.logout);
         $('#homeButton').click(function(){
//                utils.resesState();                 
                window.location.href = 'metrics_available.html';
          });
         
        utils.addNextState();
        utils.setNavigation();
        utils.setCurrentDate();   
        
        var instrumentId = utils.getUrlVars()['instrumentId'];
    
        var timingGroupId = utils.getUrlVars()['timingGroupId'];
    
        if(timingGroupId === undefined || timingGroupId === ''){
            var expirationDate = utils.getUrlVars()['expirationDate'];
            utils.setExpirationDate(expirationDate);
            load_scheduled_instruments(instrumentId);
        }
        else {
            $('#expirationDateContainer').hide();
            load_non_scheduled_instruments(instrumentId, timingGroupId);
        }
    };

    load_scheduled_instruments = function(instrumentId){
    
        var istrumentsURL = utils.baseServiceAddress() + 'Metrics/ScheduledInstruments?instrumentID=' + instrumentId;
        var authorizationCookie = utils.getAuthorizationCookie();
    
        $.ajax({
               type: 'get',
         beforeSend: function (request){
           request.setRequestHeader('X-Token', authorizationCookie.Token);    
         },
               dataType: 'json',
               url: istrumentsURL,
               async: false,
               success: function (data){
               
                 var container = 'summary_listDiv';
           
               if(data == undefined || data.length == 0){
             return;
               }
               
                   $('#groupNameDiv').html(data[0].Data.GroupName);
               
                   var n = data.length;
                 metricsNumber = n;
           
                   var metricsSummaryRow = '<div class="summary-row clear"><div id="lockDiv" class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">2.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Nurse Satisfaction</div><div class="summary-row-status right"><img id="questionerStatusImg" src="img/status_split.png" width="20" height="20"></div></div>';
                   var metricsSummaryRow1 = '<div class="summary-row clear"><div class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">1.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Group Cohesion</div><div class="summary-row-status right"><img        id="questionerStatusImg" src="img/status_check.png" width="20" height="20"></div></div>'
              
           for(var i = 0; i < data.length; ++i){
                 
                        var metricSummaryObject = data[i].Data;
                        var metricStatus = data[i].Status;
                        var metricLocked = data[i].IsLocked;
                        var id = data[i].ID;
        
                        $('#' + container).append(metricsSummaryRow);
               
                        if(i === 0){
               
                           $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('summary-row-first');
                        }
                             
                        $('#' + container + ' > div:last-child').attr('questionerId', metricSummaryObject.QuestionerID);
               
                        if(metricLocked === false){
                            $('#' + container + ' > div:last-child #questionerLockImg').remove();
                            $('#' + container + ' > div:last-child #questionerGroupTextDiv').removeClass('txt-grey');
                            $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('txt-blue');
               
                            $('#' + container + ' > div:last-child').click(function(){
                                var questionerId = $(this).attr('questionerId');
                                window.location.href = 'metrics_form.html?questionerId=' + questionerId + '&instrumentId=' +instrumentId + '&expirationDate=' + utils.getUrlVars()['expirationDate'];});
            }
                        else if(metricStatus != 2){
                           $('#' + container + ' > div:last-child').attr('title', 'start or complete the previous instrument to unlock.');
                           $('#' + container + ' > div:last-child').tooltip();
                        }
                       else if(metricStatus === 2){
                           $('#' + container + ' > div:last-child').click(function(){
                                $('.tooltip').attr('display', 'none');
                            });
                       }
               
               
                        var setStatusImg = function (){
                           
                            var statusImg  = $('#' + container + ' > div:last-child #questionerStatusImg');
                           
                            if( metricStatus === 0){
                                statusImg.attr('src', 'img/status_empty.png');
                            }
                            else if (metricStatus === 1){
                               statusImg.attr('src', 'img/status_split.png');
                            }
                            else if (metricStatus === 2){
                               statusImg.attr('src', 'img/status_check.png');
                            }
                            else if (metricStatus === 3){
                               statusImg.attr('src', 'img/status_lock.png');
                            }
                            else if (metricStatus === 4){
                               statusImg.attr('src', 'img/status_bang.png');
               }
             }
               
                      setStatusImg();
               
                      $('#' + container + ' > div:last-child #questionerNumberDiv').html((i+1) +'.');
                    $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(metricSummaryObject.GroupText);
           
                }
         
             //                  $('#' + container + ' > div').click(function(){
             // var questionerId = $(this).attr('questionerId');
             //                      window.location.href = 'metrics_form.html?questionerId' + questionerId;
             //                   });

               },
               error: function (data){
                  utils.redirectOnError();
               }
        });
    };
  
    load_non_scheduled_instruments = function(instrumentId, timingGroupId) {
    
        var nonScheduledInstrumentURL = utils.baseServiceAddress() + 'Metrics/NonScheduledInstruments?instrumentID=' + instrumentId + '&timingGroupID=' + timingGroupId;
        var authorizationCookie = utils.getAuthorizationCookie();
    
        $.ajax({
               type: 'get',
         beforeSend: function (request){
           request.setRequestHeader('X-Token', authorizationCookie.Token);    
         },
               dataType: 'json',
               url: nonScheduledInstrumentURL,
               async: false,
               success: function (data){
               
                 var container = 'summary_listDiv';
           
               if(data == undefined || data.length == 0){
             return;
               }
           
                   var metricsSummaryRow = '<div class="summary-row clear"><div id="lockDiv" class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">2.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Nurse Satisfaction</div><div class="summary-row-status right"><img id="questionerStatusImg" src="img/status_check.png" width="20" height="20"></div><div id="questionerSavedDateContainer" class="unscheduled-metric-date-container"><div class="right"><div id="questionerSavedMonth" class="month-small">AUG</div><div id="questionerSavedDay" class="day-small">1</div><div id="questionerSavedTime" class="time-small">10:00AM</div></div></div></div>';
           

           var nonScheduledInstrumentName = data.Name;
           var nonScheduledInstrumentQuestionerID = data.QuestionerID;
           
                   $('#groupNameDiv').html(nonScheduledInstrumentName);
               
                   var submittedQuestionersCount = data.Submitted.length;
                   
                   for(var i = 0; i < submittedQuestionersCount; ++i ){
                   
                       $('#' + container).append(metricsSummaryRow);
                       $('#' + container + ' > div:last-child #questionerNumberDiv').html((i + 1) +'.');
                       $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(nonScheduledInstrumentName);
               
                       var questionerSavedDateString = data.Submitted[i].Data.DTCreated;
                       var questionerSavedDate = moment(questionerSavedDateString);
               
                       $('#' + container + ' > div:last-child #questionerSavedMonth').html(questionerSavedDate.format("MMM").toLocaleUpperCase());
                       $('#' + container + ' > div:last-child #questionerSavedDay').html(questionerSavedDate.format("D"));
                       $('#' + container + ' > div:last-child #questionerSavedTime').html(questionerSavedDate           .format("hh:ssA"));
                   }


           var hasSavedInstrument = data.Saved;
           
               $('#' + container).append(metricsSummaryRow);
           
                   $('#' + container + ' > div:last-child #questionerSavedDateContainer').remove();
               
           $('#' + container + ' > div:last-child').attr('questionerId', nonScheduledInstrumentQuestionerID);
           $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('summary-row-first');
           
                   $('#' + container + ' > div:last-child #questionerLockImg').remove();
                   $('#' + container + ' > div:last-child #questionerGroupTextDiv').removeClass('txt-grey');
                   $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('txt-blue');
           
                   $('#' + container + ' > div:last-child').click(function(){
                       var questionerId = $(this).attr('questionerId');
                       window.location.href = 'metrics_form.html?questionerId=' + questionerId + '&timingGroupId=' + timingGroupId + '&instrumentId=' + instrumentId;}
           );
           
          var statusImg  = $('#' + container + ' > div:last-child #questionerStatusImg');
         
           if(hasSavedInstrument === undefined || hasSavedInstrument === '' || hasSavedInstrument.ID === 0){
                                  
             statusImg.attr('src', 'img/status_empty.png');
           }
           else {
             statusImg.attr('src', 'img/status_split.png');
           }
           
                  $('#' + container + ' > div:last-child #questionerNumberDiv').html((submittedQuestionersCount + 1) +'.');
                  $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(nonScheduledInstrumentName);
           
           
            },
         error: function (data){
                   utils.redirectOnError();
         
          }
       });
  }
}

// var metrics_summary = {
    
//      initialize: function (){
//          $('#logoutButton').click(utils.logout);
//          $('#homeButton').click(function(){
// //                utils.resesState();                 
//                 window.location.href = 'metrics_available.html';
//           });
         
//         utils.addNextState();
//         utils.setNavigation();
// 		utils.setCurrentDate();		
        
// 	 var instrumentId = utils.getUrlVars()['instrumentId'];
		
// 		var timingGroupId = utils.getUrlVars()['timingGroupId'];
		
// 		if(timingGroupId === undefined || timingGroupId === ''){
// 	        var expirationDate = utils.getUrlVars()['expirationDate'];
// 	        utils.setExpirationDate(expirationDate);
// 	        load_scheduled_instruments(instrumentId);
// 		}
// 		else {
// 			$('#expirationDateContainer').hide();
// 			load_non_scheduled_instruments(instrumentId, timingGroupId);
// 		}
		
//      },
    
//    load_scheduled_instruments= function(instrumentId){
		
// 		var istrumentsURL = utils.baseServiceAddress() + 'Metrics/ScheduledInstruments?instrumentID=' + instrumentId;
//         var authorizationCookie = utils.getAuthorizationCookie();
		
//         $.ajax({
//                type: 'get',
// 			   beforeSend: function (request){
// 			     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
// 			   },
//                dataType: 'json',
//                url: istrumentsURL,
//                async: false,
//                success: function (data){
	             
// 	               var container = 'summary_listDiv';
				   
// 		           if(data == undefined || data.length == 0){
// 					   return;
// 		           }
               
//                    $('#groupNameDiv').html(data[0].Data.GroupName);
               
//                    var n = data.length;
// 	               metricsNumber = n;
				   
//                    var metricsSummaryRow = '<div class="summary-row clear"><div id="lockDiv" class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">2.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Nurse Satisfaction</div><div class="summary-row-status right"><img id="questionerStatusImg" src="img/status_split.png" width="20" height="20"></div></div>';
//                    var metricsSummaryRow1 = '<div class="summary-row clear"><div class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">1.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Group Cohesion</div><div class="summary-row-status right"><img        id="questionerStatusImg" src="img/status_check.png" width="20" height="20"></div></div>'
              
// 				   for(var i = 0; i < data.length; ++i){
		             
//                         var metricSummaryObject = data[i].Data;
//                         var metricStatus = data[i].Status;
//                         var metricLocked = data[i].IsLocked;
//                         var id = data[i].ID;
				
//                         $('#' + container).append(metricsSummaryRow);
               
//                         if(i === 0){
               
//                            $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('summary-row-first');
//                         }
                             
//                         $('#' + container + ' > div:last-child').attr('questionerId', metricSummaryObject.QuestionerID);
               
//                         if(metricLocked === false){
//                             $('#' + container + ' > div:last-child #questionerLockImg').remove();
//                             $('#' + container + ' > div:last-child #questionerGroupTextDiv').removeClass('txt-grey');
//                             $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('txt-blue');
               
//                             $('#' + container + ' > div:last-child').click(function(){
//                                 var questionerId = $(this).attr('questionerId');
//                                 window.location.href = 'metrics_form.html?questionerId=' + questionerId + '&instrumentId=' +instrumentId + '&expirationDate=' + utils.getUrlVars()['expirationDate'];});
// 						}
//                         else if(metricStatus != 2){
//                            $('#' + container + ' > div:last-child').attr('title', 'start or complete the previous instrument to unlock.');
//                            $('#' + container + ' > div:last-child').tooltip();
//                         }
//                        else if(metricStatus === 2){
//                            $('#' + container + ' > div:last-child').click(function(){
//                                 $('.tooltip').attr('display', 'none');
//                             });
//                        }
               
               
//                         var setStatusImg = function (){
                           
//                             var statusImg  = $('#' + container + ' > div:last-child #questionerStatusImg');
                           
//                             if( metricStatus === 0){
//                                 statusImg.attr('src', 'img/status_empty.png');
//                             }
//                             else if (metricStatus === 1){
//                                statusImg.attr('src', 'img/status_split.png');
//                             }
//                             else if (metricStatus === 2){
//                                statusImg.attr('src', 'img/status_check.png');
//                             }
//                             else if (metricStatus === 3){
//                                statusImg.attr('src', 'img/status_lock.png');
//                             }
//                             else if (metricStatus === 4){
//                                statusImg.attr('src', 'img/status_bang.png');
// 						   }
// 					   }
               
//                       setStatusImg();
               
//                       $('#' + container + ' > div:last-child #questionerNumberDiv').html((i+1) +'.');
// 	                  $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(metricSummaryObject.GroupText);
           
//                 }
			   
// 					   // 	               $('#' + container + ' > div').click(function(){
// 					   // var questionerId = $(this).attr('questionerId');
// 					   // 	                   window.location.href = 'metrics_form.html?questionerId' + questionerId;
// 					   // 	                });

//                },
//                error: function (data){
//                   utils.redirectOnError();
//                }
//         });
//     };
	
// 	 load_non_scheduled_instruments : function(instrumentId, timingGroupId) {
		
// 		var nonScheduledInstrumentURL = utils.baseServiceAddress() + 'Metrics/NonScheduledInstruments?instrumentID=' + instrumentId + '&timingGroupID=' + timingGroupId;
//         var authorizationCookie = utils.getAuthorizationCookie();
		
//         $.ajax({
//                type: 'get',
// 			   beforeSend: function (request){
// 			     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
// 			   },
//                dataType: 'json',
//                url: nonScheduledInstrumentURL,
//                async: false,
//                success: function (data){
	             
// 	               var container = 'summary_listDiv';
				   
// 		           if(data == undefined || data.length == 0){
// 					   return;
// 		           }
				   
//                    var metricsSummaryRow = '<div class="summary-row clear"><div id="lockDiv" class="summary-row-status left"><img id="questionerLockImg" src="img/status_lock.png" width="20" height="20"></div><div id="questionerNumberDiv" class="summary-row-num">2.</div><div id="questionerGroupTextDiv" class="summary-row-msg txt-grey ">Nurse Satisfaction</div><div class="summary-row-status right"><img id="questionerStatusImg" src="img/status_check.png" width="20" height="20"></div><div id="questionerSavedDateContainer" class="unscheduled-metric-date-container"><div class="right"><div id="questionerSavedMonth" class="month-small">AUG</div><div id="questionerSavedDay" class="day-small">1</div><div id="questionerSavedTime" class="time-small">10:00AM</div></div></div></div>';
				   

// 				   var nonScheduledInstrumentName = data.Name;
// 				   var nonScheduledInstrumentQuestionerID = data.QuestionerID;
				   
//                    $('#groupNameDiv').html(nonScheduledInstrumentName);
               
//                    var submittedQuestionersCount = data.Submitted.length;
                   
//                    for(var i = 0; i < submittedQuestionersCount; ++i ){
                   
//                        $('#' + container).append(metricsSummaryRow);
//                        $('#' + container + ' > div:last-child #questionerNumberDiv').html((i + 1) +'.');
//                        $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(nonScheduledInstrumentName);
               
//                        var questionerSavedDateString = data.Submitted[i].Data.DTCreated;
//                        var questionerSavedDate = moment(questionerSavedDateString);
               
//                        $('#' + container + ' > div:last-child #questionerSavedMonth').html(questionerSavedDate.format("MMM").toLocaleUpperCase());
//                        $('#' + container + ' > div:last-child #questionerSavedDay').html(questionerSavedDate.format("D"));
//                        $('#' + container + ' > div:last-child #questionerSavedTime').html(questionerSavedDate           .format("hh:ssA"));
//                    }


// 				   var hasSavedInstrument = data.Saved;
				   
// 		           $('#' + container).append(metricsSummaryRow);
				   
//                    $('#' + container + ' > div:last-child #questionerSavedDateContainer').remove();
               
// 				   $('#' + container + ' > div:last-child').attr('questionerId', nonScheduledInstrumentQuestionerID);
// 				   $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('summary-row-first');
				   
//                    $('#' + container + ' > div:last-child #questionerLockImg').remove();
//                    $('#' + container + ' > div:last-child #questionerGroupTextDiv').removeClass('txt-grey');
//                    $('#' + container + ' > div:last-child #questionerGroupTextDiv').addClass('txt-blue');
				   
//                    $('#' + container + ' > div:last-child').click(function(){
//                        var questionerId = $(this).attr('questionerId');
//                        window.location.href = 'metrics_form.html?questionerId=' + questionerId + '&timingGroupId=' + timingGroupId + '&instrumentId=' + instrumentId;}
// 				   );
				   
// 				    var statusImg  = $('#' + container + ' > div:last-child #questionerStatusImg');
				 
// 				   if(hasSavedInstrument === undefined || hasSavedInstrument === '' || hasSavedInstrument.ID === 0){
						                      
// 						 statusImg.attr('src', 'img/status_empty.png');
// 				   }
// 				   else {
//  						 statusImg.attr('src', 'img/status_split.png');
// 				   }
				   
//                   $('#' + container + ' > div:last-child #questionerNumberDiv').html((submittedQuestionersCount + 1) +'.');
//                   $('#' + container + ' > div:last-child #questionerGroupTextDiv').html(nonScheduledInstrumentName);
				   
				   
//             },
// 			   error: function (data){
//                    utils.redirectOnError();
// 			   }
// 		   });
// 	}
// }