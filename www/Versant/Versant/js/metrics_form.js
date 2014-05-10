
var metrics_form = new function (){
  this.initialize = function(){
      $('#logoutButton').click(utils.logout);
        $('#home_button').click(function(){
//           utils.resetState();
           window.location.href = 'metrics_available.html';
        });
        
      utils.addNextState();
      utils.setNavigation();
      utils.setCurrentDate();
                   
      var questionerId = utils.getUrlVars()['questionerId'];
        
      var timingGroupId = utils.getUrlVars()['timingGroupId'];
      var instrumentId = utils.getUrlVars()['instrumentId'];

      var expirationDate = utils.getUrlVars()['expirationDate'];
      utils.setExpirationDate(expirationDate);
                
      var successURL = ""; 
        
      if(timingGroupId === undefined || timingGroupId === ''){
             successURL = 'metrics_summary.html?instrumentId=' + instrumentId + '&expirationDate=' + expirationDate;
             load_questions_from_scheduled_questioner(questionerId, successURL);
      }
      else {
          $('#expirationDateContainer').hide();
          successURL = 'metrics_summary.html?instrumentId=' + instrumentId + '&timingGroupId=' + timingGroupId;
          laod_questioner_from_nonscheduled_questioner(questionerId, timingGroupId, successURL);
      }
  };

  var load_questions_from_scheduled_questioner = function(questionerId, successURL){
        
        var questionsURL = utils.baseServiceAddress() + 'Metrics/ScheduledInstrumentDetails?questionerID=' + questionerId + '&eventID=' + questionerId;
        load_questions_from_questioner(questionsURL);
        
        
        var saveAnswerURL = utils.baseServiceAddress() + 'Metrics/SaveForLaterScheduled?questionerID=' + questionerId;
        $('#complete_later').click(function(){
                               saveAnswers(saveAnswerURL, successURL, 'save');
                           });
        
        var submitURL = utils.baseServiceAddress() + 'Metrics/SubmitScheduled?questionerID=' + questionerId + '&overrideWarning=false';
        
        $('#submit').click(function(){
                                $('#submitBox').show();
                                $('#submitRequestButton').click(function(){
                                                                $('#submitBox').hide();
                                                                 saveAnswers(submitURL, successURL, 'submit');
                                                            });
                               $('#cancelRequestButton').click(function(){
                                                               $('#submitBox').hide();
                                                               });
                           });
  };

  laod_questioner_from_nonscheduled_questioner = function(questionerId, timingGroupId, successURL){
       
       var questionsURL = utils.baseServiceAddress() + 'Metrics/NonScheduledInstrumentDetails?timingGroupID=' + timingGroupId + '&questionerID=' + questionerId;
       load_questions_from_questioner(questionsURL);
                           
       var saveAnswerURL = utils.baseServiceAddress() + 'Metrics/SaveForLaterNonScheduled?questionerID=' + questionerId + '&timingGroupID=' + timingGroupId;
       
       $('#complete_later').click(function(){
                                  saveAnswers(saveAnswerURL, successURL, 'save');
                                });
       
       var submitURL = utils.baseServiceAddress() + 'Metrics/SubmitNonScheduled?questionerID=' + questionerId + '&timingGroupID=' + timingGroupId + '&overrideWarning=false';

                           
       $('#submit').click(function(){
                              $('#submitBox').show();
                              $('#submitRequestButton').click(function(){
                                                                  $('#submitBox').hide();
                                                                  saveAnswers(submitURL, successURL, 'submit');
                                                              });
                              $('#cancelRequestButton').click(function(){
                                                                  $('#submitBox').hide();
                                                              });
                          });
  };

  load_questions_from_questioner = function(questionsURL){
        
       
        var authorizationCookie = utils.getAuthorizationCookie();
    
        
        $.ajax({
               type: 'get',
         beforeSend: function (request){
             request.setRequestHeader('X-Token', authorizationCookie.Token);
             
         },
               dataType: 'json',
               url: questionsURL,
               async: false,
               success: function (data){
                   var container = 'questionsContainer';
               
                   if(data == undefined || data.Questions == undefined || data.Questions.length == 0){
                       return;
                   }
               
                   if(data.LastSaved === null || data.LastSaved === undefined || data.LastSaved === ''){
                       $('#lastSavedContainer').hide();
                   }
                   else{
                       var lastSavedDate = moment(data.LastSaved);
               
                       $('#lastSavedMonthDiv').html(lastSavedDate.format("MMM"));
                       $('#lastSavedDayDiv').html(lastSavedDate.format("D"));
                       $('#lastSavedYearDiv').html(lastSavedDate.format("YYYY"));
                   }
               
                   $('#groupNameDiv').html(data.Questions[0].Data.SubGroupText);
               
                   // var questionRow = '<div class="form-question-row"><div id="questionGroup" class="form-question-row-header">Productivity</div><div class="form-question-row-content"><div class="form-question"><span id="questionText">I believe the productivity of this group is:</span></div><div id="answerDiv" class="form-answer txt-black">very much above average</div><div id="statusDiv" class="form-question-status"><img id="statusImg" src="img/status_check.png" width="24" height="24"/></div></div></div>';
            var questionRow = '<div class="form-question-row"><div class="form-question-row-content"><div class="form-question"><span class="form-question-prefix" id="prefixSpan"></span><span id="questionText">I believe the productivity of this group is:</span></div><div id="answerDiv" class="form-answer txt-black">very much above average</div><div id="statusDiv" class="form-question-status"><img id="statusImg" src="img/status_check.png" width="24" height="24"/></div></div></div>';
               
                   var n = data.Questions.length;
                   var questionNumber = n;
               
                   $('#questions_number').html(questionNumber);
               
                   for(var i = 0; i < questionNumber; ++i){
               
                       var questionObject = data.Questions[i];
               
                       try{
                           var renderer = XMLRendererFactory.makeXMLRenderer(questionObject);
                           var resultQuestionHTMLElement = renderer.convertToHTML();
                       }
                       catch(e){
                       
                       }

               
                       try{
                           if(resultQuestionHTMLElement.forEach !== undefined)
                           {
                               for(var j= 0; j < resultQuestionHTMLElement.length; j++){
                                   $('#questionsTable').append(resultQuestionHTMLElement[j]);
                               }
                           }
                           else{
                               $('#questionsTable').append(resultQuestionHTMLElement);
                           }
                       }
                       catch(e){
                       
                       }
               
//                       $('#' + container).append(questionRow);
//             
//             // if(i % 2 === 0){
//   //                $(".form-question-row-content").addClass(' form-question-row-background-color-white');       
//   //              }
//             
//                       $('#' + container + ' > div:last-child #prefixSpan').html(questionObject.ExternalRef + '    ');
//                       $('#' + container + ' > div:last-child #questionText').html(questionObject.QText);
//               
//                       var renderAnswersType = function(){
//                           var displayDefinition = questionObject.DisplayDefinition;
//               
//                           initializeRenderers();
//               
//                           var renderer = rendererFactory.getRenderer(displayDefinition);
//               
//                           try{
//                             var element = renderer.render();
//                             $('#' + container + ' > div:last-child #answerDiv').html(element);
//               }
//               catch(e){
//                
//               }
//                       }
//             
//             renderAnswersType();
                   }
           
            $('#' + container + ' > div:nth-child(odd) ').addClass('form-question-row-background-color-grey');
            $('#' + container + ' > div:nth-child(even) ').addClass('form-question-row-background-color-white');
               },
               error: function (data){
           utils.redirectOnError();
               }
            });
        };
    
        saveAnswers = function(saveURL, successURL, operation){
            
            var authorizationCookie = utils.getAuthorizationCookie();
            
            var answerCollection =  collectAnswers();
            
            if(answerCollection.length === 0)
            {
                return;
            }
            
            var responseObject = JSON.stringify(answerCollection);
            
            
            $.ajax({
                   type: 'post',
                   beforeSend: function (request){
                       request.setRequestHeader('X-Token', authorizationCookie.Token);
                   },
                   dataType: 'json',
                   contentType: 'application/json',
                   data: responseObject,
                   url: saveURL,
                   async: false,
                   success: function (data){
                       window.location.href = successURL;
                   },
                   error: function(data){
                   
                       var moveToSummary = function(){
                       window.location.href = successURL;
                       }
                       
                       var hideMessageBox = function(){
                       $('#messageBox').hide();
                       }
                   
                       if(data.statusText === 'OK'){
                   
                           if(operation === 'save'){
                               $('#messageBox').show();
                               $('#messageBoxTextDiv').html(data.responseText);
                               $('#okConfirmationButton').unbind( "click", hideMessageBox );
                               $('#okConfirmationButton').bind( "click", moveToSummary);
                           }
                           else if(operation == 'submit'){
                               $('#submitConfirmationBox').show();
                               $('#submitConfirmationTextDiv').html(data.responseText);
                               $('#submitConfirmationRequestButton').click(function(){
                                                                   var newSaveURL = saveURL.replace('false', 'true');
                                                                    saveAnswers(newSaveURL, successURL, 'save');
                                                               });
                               $('#confirmationCancelRequestButton').click(function(){
                                                                   $('#submitConfirmationBox').hide();
                                                               });
                               return;
                           }
                           else{
                   
                                   $('#okConfirmationButton').unbind( "click", moveToSummary );
                                   $('#okConfirmationButton').bind( "click", hideMessageBox);                           }
                       }
                       else if (data.statusText === 'Created'){
                           $('#messageBox').show();
                           $('#messageBoxTextDiv').html(data.responseText);
                           $('#okConfirmationButton').unbind( "click", hideMessageBox );
                           $('#okConfirmationButton').bind( "click", moveToSummary);
                       }
                       else{
                           $('#messageBox').show();
                           $('#messageBoxTextDiv').html('Sorry!Something went wrong!');
                           $('#okConfirmationButton').unbind( "click", moveToSummary );
                           $('#okConfirmationButton').bind( "click", hideMessageBox);                          }
                       }
               });
        };
    
        collectAnswers = function(){
            var answerCollection = new Array();
            
//            $('#questionsTable > tbody > tr').each(function(){
//               
//                   if ($(this).attr('data-answer-value') === 'required'){
//                       
//                       if($(this).hasattr('data-return-answer')){
//                           var questionId = $(this).attr('data-questionid');
//                           var rValue = $(this).attr('data-answer-value');
//                           var rValueInt = null;
//                                           
//                           var answerObject = {};
//                           answerObject['QuestionID'] = questionId;
//                           answerObject['RValue'] = RValue;
//                           answerObject['RValueInt'] = RValueInt;
//                                           
//                           answerCollection.push(answerObject);
//                       }
//               }
//           });
            var questions = $('#questionsTable > tbody > tr');
                           
            for(var i = 0; i < questions.length; i++){
                           
                var question = questions[i];
                           
                if($(question).attr('data-return-answer') === 'required'){
                    
                    if($(question).attr('data-answer-value') !== undefined){
                        
                        var answerValues = JSON.parse($(question).attr('data-answer-value'));
                        
//                        var questionId = $(question).attr('data-questionid');
//                        var rValue = $(question).attr('data-answer-value');
//                        var rValueInt = null;
                        
                        for(var j = 0; j < answerValues.length; j++){
                            
                            var answerObject = {};
                            answerObject['QuestionID'] = answerValues[j].questionId;
                            answerObject['RValue'] = answerValues[j].RValue;
                            answerObject['RValueInt'] = answerValues[j].RValueInt;
                            
                            answerCollection.push(answerObject);

                        }
                    }
                }
            }
            
            return answerCollection;
        };
}

// = {
// 	initialize: function(){
// 	    $('#logoutButton').click(utils.logout);
//         $('#home_button').click(function(){
// //           utils.resetState();
//            window.location.href = 'metrics_available.html';
//         });
        
//       utils.addNextState();
//       utils.setNavigation();
//   	  utils.setCurrentDate();
                   
//       var questionerId = utils.getUrlVars()['questionerId'];
    		
//     	var timingGroupId = utils.getUrlVars()['timingGroupId'];
//       var instrumentId = utils.getUrlVars()['instrumentId'];

//       var expirationDate = utils.getUrlVars()['expirationDate'];
//       utils.setExpirationDate(expirationDate);
                
//       var successURL = ""; 
    		
//       if(timingGroupId === undefined || timingGroupId === ''){
//     	       successURL = 'metrics_summary.html?instrumentId=' + instrumentId + '&expirationDate=' + expirationDate;
//              this.load_questions_from_scheduled_questioner(questionerId, successURL);
//     	}
//     	else {
//     			$('#expirationDateContainer').hide();
//           successURL = 'metrics_summary.html?instrumentId=' + instrumentId + '&timingGroupId=' + timingGroupId;
//     			this.laod_questioner_from_nonscheduled_questioner(questionerId, timingGroupId, successURL);
//     	}
// 	},
	
// 	load_questions_from_scheduled_questioner: function(questionerId, successURL){
        
//         var questionsURL = utils.baseServiceAddress() + 'Metrics/ScheduledInstrumentDetails?questionerID=' + questionerId + '&eventID=' + questionerId;
//         this.load_questions_from_questioner(questionsURL);
        
        
//         var saveAnswerURL = utils.baseServiceAddress() + 'Metrics/SaveForLaterScheduled?questionerID=' + questionerId;
//         $('#complete_later').click(function(){
//                                saveAnswers(saveAnswerURL, successURL, 'save');
//                            });
        
//         var submitURL = utils.baseServiceAddress() + 'Metrics/SubmitScheduled?questionerID=' + questionerId + '&overrideWarning=false';
        
//         $('#submit').click(function(){
//                                 $('#submitBox').show();
//                                 $('#submitRequestButton').click(function(){
//                                                                 $('#submitBox').hide();
//                                                                  saveAnswers(submitURL, successURL, 'submit');
//                                                             });
//                                $('#cancelRequestButton').click(function(){
//                                                                $('#submitBox').hide();
//                                                                });
//                            });
// 	},
	
// 	laod_questioner_from_nonscheduled_questioner: function(questionerId, timingGroupId, successURL){
       
//        var questionsURL = utils.baseServiceAddress() + 'Metrics/NonScheduledInstrumentDetails?timingGroupID=' + timingGroupId + '&questionerID=' + questionerId;
//        this.load_questions_from_questioner(questionsURL);
                           
//        var saveAnswerURL = utils.baseServiceAddress() + 'Metrics/SaveForLaterNonScheduled?questionerID=' + questionerId + '&timingGroupID=' + timingGroupId;
       
//        $('#complete_later').click(function(){
//                                   saveAnswers(saveAnswerURL, successURL, 'save');
//                                 });
       
//        var submitURL = utils.baseServiceAddress() + 'Metrics/SubmitNonScheduled?questionerID=' + questionerId + '&timingGroupID=' + timingGroupId + '&overrideWarning=false';

                           
//        $('#submit').click(function(){
//                               $('#submitBox').show();
//                               $('#submitRequestButton').click(function(){
//                                                                   $('#submitBox').hide();
//                                                                   saveAnswers(submitURL, successURL, 'submit');
//                                                               });
//                               $('#cancelRequestButton').click(function(){
//                                                                   $('#submitBox').hide();
//                                                               });
//                           });
// 	},
	
    
//     load_questions_from_questioner: function(questionsURL){
        
       
//         var authorizationCookie = utils.getAuthorizationCookie();
		
        
//         $.ajax({
//                type: 'get',
// 			   beforeSend: function (request){
//                request.setRequestHeader('X-Token', authorizationCookie.Token);
// 			   },
//                dataType: 'json',
//                url: questionsURL,
//                async: false,
//                success: function (data){
//                    var container = 'questionsContainer';
               
//                    if(data == undefined || data.Questions == undefined || data.Questions.length == 0){
//                        return;
//                    }
               
//                    if(data.LastSaved === null || data.LastSaved === undefined || data.LastSaved === ''){
//                        $('#lastSavedContainer').hide();
//                    }
//                    else{
//                        var lastSavedDate = moment(data.LastSaved);
               
//                        $('#lastSavedMonthDiv').html(lastSavedDate.format("MMM"));
//                        $('#lastSavedDayDiv').html(lastSavedDate.format("D"));
//                        $('#lastSavedYearDiv').html(lastSavedDate.format("YYYY"));
//                    }
               
//                    $('#groupNameDiv').html(data.Questions[0].Data.SubGroupText);
               
//                    // var questionRow = '<div class="form-question-row"><div id="questionGroup" class="form-question-row-header">Productivity</div><div class="form-question-row-content"><div class="form-question"><span id="questionText">I believe the productivity of this group is:</span></div><div id="answerDiv" class="form-answer txt-black">very much above average</div><div id="statusDiv" class="form-question-status"><img id="statusImg" src="img/status_check.png" width="24" height="24"/></div></div></div>';
// 				    var questionRow = '<div class="form-question-row"><div class="form-question-row-content"><div class="form-question"><span class="form-question-prefix" id="prefixSpan"></span><span id="questionText">I believe the productivity of this group is:</span></div><div id="answerDiv" class="form-answer txt-black">very much above average</div><div id="statusDiv" class="form-question-status"><img id="statusImg" src="img/status_check.png" width="24" height="24"/></div></div></div>';
               
//                    var n = data.Questions.length;
//                    var questionNumber = n;
               
//                    $('#questions_number').html(questionNumber);
               
//                    for(var i = 0; i < questionNumber; ++i){
               
//                        var questionObject = data.Questions[i];
               
//                        try{
//                            var renderer = XMLRendererFactory.makeXMLRenderer(questionObject);
//                            var resultQuestionHTMLElement = renderer.convertToHTML();
//                        }
//                        catch(e){
                       
//                        }

               
//                        try{
//                            if(resultQuestionHTMLElement.forEach !== undefined)
//                            {
//                                for(var j= 0; j < resultQuestionHTMLElement.length; j++){
//                                    $('#questionsTable').append(resultQuestionHTMLElement[j]);
//                                }
//                            }
//                            else{
//                                $('#questionsTable').append(resultQuestionHTMLElement);
//                            }
//                        }
//                        catch(e){
                       
//                        }
               
// //                       $('#' + container).append(questionRow);
// //					   
// //					   // if(i % 2 === 0){
// //   // 						   $(".form-question-row-content").addClass(' form-question-row-background-color-white');	      
// //   // 					   }
// //					   
// //                       $('#' + container + ' > div:last-child #prefixSpan').html(questionObject.ExternalRef + '    ');
// //                       $('#' + container + ' > div:last-child #questionText').html(questionObject.QText);
// //               
// //                       var renderAnswersType = function(){
// //                           var displayDefinition = questionObject.DisplayDefinition;
// //               
// //                           initializeRenderers();
// //               
// //                           var renderer = rendererFactory.getRenderer(displayDefinition);
// //               
// //                           try{
// //	                           var element = renderer.render();
// //	                           $('#' + container + ' > div:last-child #answerDiv').html(element);
// //						   }
// //						   catch(e){
// //						   	
// //						   }
// //                       }
// //					   
// //					   renderAnswersType();
//                    }
				   
// 				    $('#' + container + ' > div:nth-child(odd) ').addClass('form-question-row-background-color-grey');
// 				    $('#' + container + ' > div:nth-child(even) ').addClass('form-question-row-background-color-white');
//                },
//                error: function (data){
// 				   utils.redirectOnError();
//                }
//             });
//         },
    
//         saveAnswers: function(saveURL, successURL, operation){
            
//             var authorizationCookie = utils.getAuthorizationCookie();
            
//             var answerCollection =  collectAnswers();
            
//             if(answerCollection.length === 0)
//             {
//                 return;
//             }
            
//             var responseObject = JSON.stringify(answerCollection);
            
            
//             $.ajax({
//                    type: 'post',
//                    beforeSend: function (request){
//                        request.setRequestHeader('X-Token', authorizationCookie.Token);
//                    },
//                    dataType: 'json',
//                    contentType: 'application/json',
//                    data: responseObject,
//                    url: saveURL,
//                    async: false,
//                    success: function (data){
//                        window.location.href = successURL;
//                    },
//                    error: function(data){
                   
//                        var moveToSummary = function(){
//                        window.location.href = successURL;
//                        }
                       
//                        var hideMessageBox = function(){
//                        $('#messageBox').hide();
//                        }
                   
//                        if(data.statusText === 'OK'){
                   
//                            if(operation === 'save'){
//                                $('#messageBox').show();
//                                $('#messageBoxTextDiv').html(data.responseText);
//                                $('#okConfirmationButton').unbind( "click", hideMessageBox );
//                                $('#okConfirmationButton').bind( "click", moveToSummary);
//                            }
//                            else if(operation == 'submit'){
//                                $('#submitConfirmationBox').show();
//                                $('#submitConfirmationTextDiv').html(data.responseText);
//                                $('#submitConfirmationRequestButton').click(function(){
//                                                                    var newSaveURL = saveURL.replace('false', 'true');
//                                                                     saveAnswers(newSaveURL, successURL, 'save');
//                                                                });
//                                $('#confirmationCancelRequestButton').click(function(){
//                                                                    $('#submitConfirmationBox').hide();
//                                                                });
//                                return;
//                            }
//                            else{
                   
//                                    $('#okConfirmationButton').unbind( "click", moveToSummary );
//                                    $('#okConfirmationButton').bind( "click", hideMessageBox);                           }
//                        }
//                        else if (data.statusText === 'Created'){
//                            $('#messageBox').show();
//                            $('#messageBoxTextDiv').html(data.responseText);
//                            $('#okConfirmationButton').unbind( "click", hideMessageBox );
//                            $('#okConfirmationButton').bind( "click", moveToSummary);
//                        }
//                        else{
//                            $('#messageBox').show();
//                            $('#messageBoxTextDiv').html('Sorry!Something went wrong!');
//                            $('#okConfirmationButton').unbind( "click", moveToSummary );
//                            $('#okConfirmationButton').bind( "click", hideMessageBox);                          }
//                        }
//                });
//         },
    
//         collectAnswers: function(){
//             var answerCollection = new Array();
            
// //            $('#questionsTable > tbody > tr').each(function(){
// //               
// //                   if ($(this).attr('data-answer-value') === 'required'){
// //                       
// //                       if($(this).hasattr('data-return-answer')){
// //                           var questionId = $(this).attr('data-questionid');
// //                           var rValue = $(this).attr('data-answer-value');
// //                           var rValueInt = null;
// //                                           
// //                           var answerObject = {};
// //                           answerObject['QuestionID'] = questionId;
// //                           answerObject['RValue'] = RValue;
// //                           answerObject['RValueInt'] = RValueInt;
// //                                           
// //                           answerCollection.push(answerObject);
// //                       }
// //               }
// //           });
//             var questions = $('#questionsTable > tbody > tr');
                           
//             for(var i = 0; i < questions.length; i++){
                           
//                 var question = questions[i];
                           
//                 if($(question).attr('data-return-answer') === 'required'){
                    
//                     if($(question).attr('data-answer-value') !== undefined){
                        
//                         var answerValues = JSON.parse($(question).attr('data-answer-value'));
                        
// //                        var questionId = $(question).attr('data-questionid');
// //                        var rValue = $(question).attr('data-answer-value');
// //                        var rValueInt = null;
                        
//                         for(var j = 0; j < answerValues.length; j++){
                            
//                             var answerObject = {};
//                             answerObject['QuestionID'] = answerValues[j].questionId;
//                             answerObject['RValue'] = answerValues[j].RValue;
//                             answerObject['RValueInt'] = answerValues[j].RValueInt;
                            
//                             answerCollection.push(answerObject);

//                         }
//                     }
//                 }
//             }
            
//             return answerCollection;
//         }
// }