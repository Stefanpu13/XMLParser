var timingGroups = new function(){

	this.initialize = function (){
		getTimingGroups();
        $('#timingGroupSelectDiv').click(function (e) {
                                    $('#timingGroupDiv').show();
                                });        
	};

	getTimingGroups = function() {
		
		var authorizationCookie = utils.getAuthorizationCookie();
        
        $.ajax({
	               type: 'get',
				   beforeSend: function (request){
				     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
				   },
	               dataType: 'json',
	               url: utils.baseServiceAddress() + 'TimingGroup',
	               async: false,
	               success: function (data){
					   var timiningGroups = data;
					   var n = data.length;
					   
					   for(var i = 0; i < n; i++){
						   
						      var timingGroupObject = timiningGroups[i];
                              $('#timingGroupDiv').append($('<div data-timingGroupId="' + timingGroupObject.ID + '" class="combo-item">' + timingGroupObject.Data.Name + '</div>'));
                           }
              
                           $('#timingGroupDiv div').click( function (e) {
	                           $('#timingGroupSelectDiv').html($(this).html());
	                           $('#timingGroupSelectDiv').attr('data-timingGroupId', $(this).attr('data-timingGroupId'));
	                           $('#timingGroupDiv').hide();
                                                          
                               getNonScheduledMetricsByTimingGroup($('#timingGroupSelectDiv').attr('data-timingGroupId'));
                           });
				   },					   
	               error: function (data){
                       utils.redirectOnError();
	               }
           });
    };
	
	getNonScheduledMetricsByTimingGroup = function(timingGroupId){
		var nonScheduledMetricsByTimingGroupURL = utils.baseServiceAddress() + 'Metrics/NonScheduled?timingGroupID=' + timingGroupId;
		
        var authorizationCookie = utils.getAuthorizationCookie();
        
        var metricsNumber = 0;
		var container = 'nonScheduledMetricsDiv';
		var expandContainer = 'nonScheduledMetricsExpandDiv';
        
        $('#' + container).html('');
        $('#' + expandContainer).html('');
        $('#' + expandContainer).hide();
        
        $.ajax({
               type: 'get',
			   beforeSend: function (request){
			     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
			   },
               dataType: 'json',
               url: nonScheduledMetricsByTimingGroupURL,
               async: false,
               success: function (data){
               		
		           if(data == undefined || data.length == 0){
					   $('#timingGroupResultsDiv').hide();
					   return;
		           }
				   else{
				   	   $('#timingGroupResultsDiv').show();
				   }
               
               
	               var n = data.length;
	               metricsNumber = n;
			       
				   //var metricRow = '<div class="metric-row"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
			       var metricRow = ' <div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">GACH Last Wk of Program instrument Pkt</div><div class="nsmetric-sub-container"><div id="submissionsCount" class="nsmetric-sub">0</div><div id="submissionDateContainer"></div></div></div>';
				   
				   var submissionDateAvailable = '<div class="datebox-small bg-blue right"><div id="submissionMonth" class="month-small">AUG</div><div id="submissionDay" class="day-small">2</div><div id="submissionYear" class="time-small">2014</div></div>';
				   var submissionDateUnAvailable = '<div class="datebox-small bg-grey right"><div class="na-small">n/a</div></div>';
				   // var firstMetricRowDiv = '<div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
			       //     
			       // var secondMetricRowDiv = '<div class="metric-row bg-light-grey"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">Morbi dignissim tortor id ante varius ultricies (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-green left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">9:00AM</div></div><div class="datebox-small bg-green right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">10:00PM</div></div></div></div>'
              
			   
				   for(var i = 0; i < data.length; ++i){
		                var metricObject = data[i].Data;
						var metricStatus = data[i].Status;
                        var numberOfSubmissions = data[i].NumberOfSubmissions;
                        var lastSubmissionDate = data[i].LastSubmissionDate;
                        var instrumentId = data[i].ID;
				
							if(i > 1){
								if(container == 'nonScheduledMetricsDiv'){
									container = 'nonScheduledMetricsExpandDiv';
									expandContainer = container;
								}
							}
				           
		                   $('#' + container).append(metricRow);
			               if (i % 2 === 0){
							   $('#' + container + ' > div:last-child').addClass('bg-white')
			               }
			               else{			              
						      $('#' + container + ' > div:last-child').addClass('bg-light-grey')
		                   }
               
                           var setStatusImg = function (){
						   
                               var statusImg  = $('#' + container + ' > div:last-child #statusImg');
                               
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
                                   statusImg.attr('src', 'img/status_empty.png');
                               }
                               else if (metricStatus === 4){
                                   statusImg.attr('src', 'img/status_empty.png');
                               }
					   }
                       setStatusImg();
               
                       $('#' + container + ' > div:last-child').attr('instrumentId', instrumentId);
                       $('#' + container + ' > div:last-child').attr('timingGroupId', timingGroupId);
               
                       $('#' + container + ' > div:last-child #metricNameDiv').html(metricObject.GroupName);
                       $('#' + container + ' > div:last-child #submissionsCount').html(numberOfSubmissions);
               
                       var setSubmissionDate = function(){
                           if(lastSubmissionDate === null || lastSubmissionDate === undefined){
                           $('#' + container + ' > div:last-child #submissionDateContainer').html(submissionDateUnAvailable);
                           
                           }else{
                           $('#' + container + ' > div:last-child #submissionDateContainer').html(submissionDateAvailable);
                           
                           var lastSubmissionDateObject = moment(lastSubmissionDate);
                           
                           $('#' + container + ' > div:last-child #submissionDateContainer #submissionMonth').html(lastSubmissionDateObject.format("MMM"));
                           
                           $('#' + container + ' > div:last-child #submissionDateContainer #submissionDay').html(lastSubmissionDateObject.format("D"));
                           
                           $('#' + container + ' > div:last-child #submissionDateContainer #submissionYear').html(lastSubmissionDateObject.format("YYYY"));
                           
                           }
                       }
               
                       setSubmissionDate();
					   
					   var navigateToNonScheduledInstrument = function(){
						   var instrumentId = $(this).attr('instrumentId');
						   var timingGroupId = $(this).attr('timingGroupId');
						   
						   window.location.href = ('metrics_summary.html?instrumentId=' + instrumentId + '&timingGroupId=' + timingGroupId );
					   }
					   
					   $('#nonScheduledMetricsDiv > div ').click(navigateToNonScheduledInstrument);
					   $('#nonScheduledMetricsExpandDiv > div').click(navigateToNonScheduledInstrument);
				 }
               },
               error: function (data){
                   utils.redirectOnError();          
			   }
           });

        
        var setExpand = function(metricsCount){
            if(metricsCount < 3){
                $('#expandNonScheduledMetricsButton').hide();
				 $('#collapseNonScheduledMetricsButton').hide();
            }
            else{
				$('#expandNonScheduledMetricsButton').show();
				$('#collapseNonScheduledMetricsButton').hide();
                $('#expandNonScheduledMetricsButton').click(function(){
                                         $('#' + expandContainer).show();
                                         $('#collapseNonScheduledMetricsButton').show();
                                         $('#expandNonScheduledMetricsButton').hide();
                                      });
                
                $('#collapseNonScheduledMetricsButton').click(function(){
                                         $('#' + expandContainer).hide();
                                         $('#collapseNonScheduledMetricsButton').hide();
                                         $('#expandNonScheduledMetricsButton').show();
                                     });
            }
        };
        
        setExpand(metricsNumber);        
	};	
}

// timingGroups = {
            
//     initialize: function(){
//         this.getTimingGroups();
//         $('#timingGroupSelectDiv').click(function (e) {
//                                     $('#timingGroupDiv').show();
//                                 });        
//     },
	
// 	getTimingGroups : function() {
		
// 		var authorizationCookie = utils.getAuthorizationCookie();
        
//         $.ajax({
// 	               type: 'get',
// 				   beforeSend: function (request){
// 				     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
// 				   },
// 	               dataType: 'json',
// 	               url: utils.baseServiceAddress() + 'TimingGroup',
// 	               async: false,
// 	               success: function (data){
// 					   var timiningGroups = data;
// 					   var n = data.length;
					   
// 					   for(var i = 0; i < n; i++){
						   
// 						      var timingGroupObject = timiningGroups[i];
//                               $('#timingGroupDiv').append($('<div data-timingGroupId="' + timingGroupObject.ID + '" class="combo-item">' + timingGroupObject.Data.Name + '</div>'));
//                            }
              
//                            $('#timingGroupDiv div').click( function (e) {
// 	                           $('#timingGroupSelectDiv').html($(this).html());
// 	                           $('#timingGroupSelectDiv').attr('data-timingGroupId', $(this).attr('data-timingGroupId'));
// 	                           $('#timingGroupDiv').hide();
                                                          
//                                timingGroups.getNonScheduledMetricsByTimingGroup($('#timingGroupSelectDiv').attr('data-timingGroupId'));
//                            });
// 				   },					   
// 	               error: function (data){
//                        utils.redirectOnError();
// 	               }
//            });
//     },
	
// 	getNonScheduledMetricsByTimingGroup: function(timingGroupId){
// 		var nonScheduledMetricsByTimingGroupURL = utils.baseServiceAddress() + 'Metrics/NonScheduled?timingGroupID=' + timingGroupId;
		
//         var authorizationCookie = utils.getAuthorizationCookie();
        
//         var metricsNumber = 0;
// 		var container = 'nonScheduledMetricsDiv';
// 		var expandContainer = 'nonScheduledMetricsExpandDiv';
        
//         $('#' + container).html('');
//         $('#' + expandContainer).html('');
//         $('#' + expandContainer).hide();
        
//         $.ajax({
//                type: 'get',
// 			   beforeSend: function (request){
// 			     request.setRequestHeader('X-Token', authorizationCookie.Token);  	
// 			   },
//                dataType: 'json',
//                url: nonScheduledMetricsByTimingGroupURL,
//                async: false,
//                success: function (data){
               		
// 		           if(data == undefined || data.length == 0){
// 					   $('#timingGroupResultsDiv').hide();
// 					   return;
// 		           }
// 				   else{
// 				   	   $('#timingGroupResultsDiv').show();
// 				   }
               
               
// 	               var n = data.length;
// 	               metricsNumber = n;
			       
// 				   //var metricRow = '<div class="metric-row"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
// 			       var metricRow = ' <div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">GACH Last Wk of Program instrument Pkt</div><div class="nsmetric-sub-container"><div id="submissionsCount" class="nsmetric-sub">0</div><div id="submissionDateContainer"></div></div></div>';
				   
// 				   var submissionDateAvailable = '<div class="datebox-small bg-blue right"><div id="submissionMonth" class="month-small">AUG</div><div id="submissionDay" class="day-small">2</div><div id="submissionYear" class="time-small">2014</div></div>';
// 				   var submissionDateUnAvailable = '<div class="datebox-small bg-grey right"><div class="na-small">n/a</div></div>';
// 				   // var firstMetricRowDiv = '<div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
// 			       //     
// 			       // var secondMetricRowDiv = '<div class="metric-row bg-light-grey"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">Morbi dignissim tortor id ante varius ultricies (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-green left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">9:00AM</div></div><div class="datebox-small bg-green right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">10:00PM</div></div></div></div>'
              
			   
// 				   for(var i = 0; i < data.length; ++i){
// 		                var metricObject = data[i].Data;
// 						var metricStatus = data[i].Status;
//                         var numberOfSubmissions = data[i].NumberOfSubmissions;
//                         var lastSubmissionDate = data[i].LastSubmissionDate;
//                         var instrumentId = data[i].ID;
				
// 							if(i > 1){
// 								if(container == 'nonScheduledMetricsDiv'){
// 									container = 'nonScheduledMetricsExpandDiv';
// 									expandContainer = container;
// 								}
// 							}
				           
// 		                   $('#' + container).append(metricRow);
// 			               if (i % 2 === 0){
// 							   $('#' + container + ' > div:last-child').addClass('bg-white')
// 			               }
// 			               else{			              
// 						      $('#' + container + ' > div:last-child').addClass('bg-light-grey')
// 		                   }
               
//                            var setStatusImg = function (){
						   
//                                var statusImg  = $('#' + container + ' > div:last-child #statusImg');
                               
//                                if( metricStatus === 0){
//                                    statusImg.attr('src', 'img/status_empty.png');
//                                }
//                                else if (metricStatus === 1){
//                                    statusImg.attr('src', 'img/status_split.png');
//                                }
//                                else if (metricStatus === 2){
//                                    statusImg.attr('src', 'img/status_check.png');
//                                }
//                                else if (metricStatus === 3){
//                                    statusImg.attr('src', 'img/status_empty.png');
//                                }
//                                else if (metricStatus === 4){
//                                    statusImg.attr('src', 'img/status_empty.png');
//                                }
// 					   }
//                        setStatusImg();
               
//                        $('#' + container + ' > div:last-child').attr('instrumentId', instrumentId);
//                        $('#' + container + ' > div:last-child').attr('timingGroupId', timingGroupId);
               
//                        $('#' + container + ' > div:last-child #metricNameDiv').html(metricObject.GroupName);
//                        $('#' + container + ' > div:last-child #submissionsCount').html(numberOfSubmissions);
               
//                        var setSubmissionDate = function(){
//                            if(lastSubmissionDate === null || lastSubmissionDate === undefined){
//                            $('#' + container + ' > div:last-child #submissionDateContainer').html(submissionDateUnAvailable);
                           
//                            }else{
//                            $('#' + container + ' > div:last-child #submissionDateContainer').html(submissionDateAvailable);
                           
//                            var lastSubmissionDateObject = moment(lastSubmissionDate);
                           
//                            $('#' + container + ' > div:last-child #submissionDateContainer #submissionMonth').html(lastSubmissionDateObject.format("MMM"));
                           
//                            $('#' + container + ' > div:last-child #submissionDateContainer #submissionDay').html(lastSubmissionDateObject.format("D"));
                           
//                            $('#' + container + ' > div:last-child #submissionDateContainer #submissionYear').html(lastSubmissionDateObject.format("YYYY"));
                           
//                            }
//                        }
               
//                        setSubmissionDate();
					   
// 					   var navigateToNonScheduledInstrument = function(){
// 						   var instrumentId = $(this).attr('instrumentId');
// 						   var timingGroupId = $(this).attr('timingGroupId');
						   
// 						   window.location.href = ('metrics_summary.html?instrumentId=' + instrumentId + '&timingGroupId=' + timingGroupId );
// 					   }
					   
// 					   $('#nonScheduledMetricsDiv > div ').click(navigateToNonScheduledInstrument);
// 					   $('#nonScheduledMetricsExpandDiv > div').click(navigateToNonScheduledInstrument);
// 				 }
//                },
//                error: function (data){
//                    utils.redirectOnError();          
// 			   }
//            });

        
//         var setExpand = function(metricsCount){
//             if(metricsCount < 3){
//                 $('#expandNonScheduledMetricsButton').hide();
// 				 $('#collapseNonScheduledMetricsButton').hide();
//             }
//             else{
// 				$('#expandNonScheduledMetricsButton').show();
// 				$('#collapseNonScheduledMetricsButton').hide();
//                 $('#expandNonScheduledMetricsButton').click(function(){
//                                          $('#' + expandContainer).show();
//                                          $('#collapseNonScheduledMetricsButton').show();
//                                          $('#expandNonScheduledMetricsButton').hide();
//                                       });
                
//                 $('#collapseNonScheduledMetricsButton').click(function(){
//                                          $('#' + expandContainer).hide();
//                                          $('#collapseNonScheduledMetricsButton').hide();
//                                          $('#expandNonScheduledMetricsButton').show();
//                                      });
//             }
//         };
        
//         setExpand(metricsNumber);        
// 	}	
// }

