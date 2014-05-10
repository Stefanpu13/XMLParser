var metrics = new function()
	{
		this.initialize = function (){
	        
	        $('#logoutButton').click(utils.logout);
	        $('#home_button').click(function(){
	            //           utils.resetState();
	            window.location.href = 'metrics_available.html';
	        });
			
	        utils.addNextState();
	        utils.setNavigation();
			utils.setUserData();
			utils.setCurrentDate();
	        addAvailableMetrics();
			setMetricTabs();
		};

		setMetricTabs = function (){
		$('#availableMetricsTab').click( function() {
			
			if ($('#availableMetricsTab').hasClass('bg-tab-enabled')){
				return;
			}
			
			$('#availableMetricsTab').removeClass('bg-tab-disabled');
			$('#availableMetricsTab').addClass('bg-tab-enabled');
			
			$('#upcomingMetricsTab').removeClass('bg-tab-enabled');
			$('#upcomingMetricsTab').addClass('bg-tab-disabled');
			
			$("#packagesAvailableDiv").show();
	 	   	$("#upcomingMetricsAvailableDiv").hide();
			
			addAvailableMetrics()
		});
	    
		$('#upcomingMetricsTab').click( function () {
			
			if ($('#upcomingMetricsTab').hasClass('bg-tab-enabled')){
				return;
			}
			
			$('#upcomingMetricsTab').removeClass('bg-tab-disabled');
			$('#upcomingMetricsTab').addClass('bg-tab-enabled');
			
			$('#availableMetricsTab').removeClass('bg-tab-enabled');
			$('#availableMetricsTab').addClass('bg-tab-disabled');
			
		    $("#upcomingMetricsAvailableDiv").show();
		    $("#packagesAvailableDiv").hide();
			
			addUpcomingMetrics()		
		});
	};
	
	addAvailableMetrics = function () {
        $('#upcomingMetricsMasterDiv').hide();
        $('#availableMetricsMasterDiv').show();
		
		$('#availableMetricsDiv').html('');
		$('#availableMetricsExpandDiv').html('');

		var metricsType = 'availableMetrics';
		var availableMetricsURL =  utils.baseServiceAddress() + 'Metrics/Available';
		
		addMetrics(metricsType, availableMetricsURL);
	};
	
	addUpcomingMetrics = function (){
        
        $('#availableMetricsMasterDiv').hide();
        $('#upcomingMetricsMasterDiv').show();
		
		$('#upcomingMetricsDiv').html('');
		$('#upcomingMetricsExpandDiv').html('');
		
        
		var metricsType = 'upcomingMetrics';
		var upcomingMetricsURL = utils.baseServiceAddress() + 'Metrics/Upcoming';
		
		addMetrics(metricsType, upcomingMetricsURL);
	};
	
    
    addMetrics = function (metricsType, metricsTypeURL){
		
        $('#expandButton').hide();
	    $('#hideButton').hide();
	   
		var authorizationCookie = utils.getAuthorizationCookie();
        
        var metricsNumber = 0;
		var expandContainer = '';
        
        $.ajax({
               type: 'get',
			   beforeSend: function (request){
			     request.setRequestHeader('X-Token', authorizationCookie.Token);
//                 request.setRequestHeader('Access-Control-Allow-Origin', '*');
			   },
               dataType: 'json',
               url: metricsTypeURL,
               async: false,
               success: function (data){
				   
	             
	               var container = 'availableMetricsDiv';
				   var masterContainer = 'availableMetricsMasterDiv';
			   
				   if(metricsType === 'availableMetrics'){
					   container = 'availableMetricsDiv';
					   masterContainer = 'availableMetricsMasterDiv';
				   }
				   else if(metricsType == 'upcomingMetrics'){
				   	   container = 'upcomingMetricsDiv';
					   masterContainer = 'upcomingMetricsMasterDiv';
				   }
				   
		           if(data == undefined || data.length == 0){
		               $('#unavailableMetricsDiv').show();
		               $('#' + masterContainer).hide();
					   $('#metricHeader').hide();
					   return;
		           }
				   else{
				   	    $('#unavailableMetricsDiv').hide();
					    $('#metricHeader').show();
				   }
               
	               var n = data.length;
	               metricsNumber = n;
				   
                   var calculateAvailablePackages = function(){
                   	   var availablePackagesCount = 0;
					   
					   for (var i = 0; i < n; ++i){
						   if(data[i].Status === 0 || data[i].Status === 1){
							   availablePackagesCount = availablePackagesCount + 1;
						   }
					   }
					   
					   $("#packagesAvailableSpan").html(availablePackagesCount);
                   }
				   
				   var calcualteUpcomingMetrics = function(){
					   var upcomingMetricsCount = n;
					   $("#upcomingMetricsAvailableSpan").html(upcomingMetricsCount);
				   }
			   
				   if(metricsType === 'availableMetrics'){
					   calculateAvailablePackages();
				   }
				   else if(metricsType == 'upcomingMetrics'){
					   calcualteUpcomingMetrics();
				   }
               
			   
			       var firstMetricRowDiv = '<div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
    
			       var secondMetricRowDiv = '<div class="metric-row bg-light-grey"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">Morbi dignissim tortor id ante varius ultricies (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-green left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">9:00AM</div></div><div class="datebox-small bg-green right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">10:00PM</div></div></div></div>'
              
			   
				   for(var i = 0; i < data.length; ++i){
		                var metricObject = data[i].Data;
						var metricStatus = data[i].Status;
				
						if(i > 1){
							if(container == 'availableMetricsDiv'){
								container = 'availableMetricsExpandDiv';
								expandContainer = container;
							}
							else if(container == 'upcomingMetricsDiv'){
								container = 'upcomingMetricsExpandDiv';
								expandContainer = container;
							}
						}
				
		               if (i % 2 === 0){
		                  $('#' + container).append(firstMetricRowDiv);
		               }
		               else{
		                  $('#' + container).append(secondMetricRowDiv);
		               }
					   
					   $('#' + container + ' > div:last-child').attr('instrumentId', metricObject.EventID);
				   
				       // setStatusImg();
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
	                  $('#' + container + ' > div:last-child #metricNameDiv').html(metricObject.GroupName);
           
	                  var startDateString = metricObject.StartDate;
					  var startDate = moment(startDateString);				   
        
	                  $('#' + container + ' > div:last-child #metricDateStartMonth').html(startDate.format("MMM").toLocaleUpperCase());
	                  $('#' + container + ' > div:last-child #metricDateStartDay').html(startDate.format("D"));
	                  $('#' + container + ' > div:last-child #metricDateStartTime').html(startDate.format("hh:ssA"));
           
	                  var endDateString = metricObject.EndDate;
	                  var endDate = moment(endDateString);	
               
                      $('#' + container + ' > div:last-child').attr('expirationDate', endDateString);
           
	                  $('#' + container + ' > div:last-child #metricDateEndMonth').html(endDate.format("MMM").toLocaleUpperCase());
	                  $('#' + container + ' > div:last-child #metricDateEndDay').html(endDate.format("D"));
	                  $('#' + container + ' > div:last-child #metricDateEndTime').html(endDate.format("hh:mmA"));
               }
			   
			   if(metricsType === 'availableMetrics'){
				       var navigate_to_metrics_summary = function (){
					   var instrumentId = $(this).attr('instrumentId');
	                   var expirationDate = $(this).attr('expirationDate');
	                   window.location.href = ('metrics_summary.html?instrumentId=' + instrumentId + '&expirationDate=' + expirationDate);
				   }
			   
	               $('#availableMetricsDiv > div').click(navigate_to_metrics_summary);
				   $('#availableMetricsExpandDiv > div').click(navigate_to_metrics_summary);
			   }			   

               },
               error: function (data){
       				utils.redirectOnError();
               }
               });

        
        var setExpand = function(metricsCount){
            if(metricsCount < 3){
                $('#expandButton').hide();
				$('#hideButton').hide();
            }
            else{
				$('#expandButton').show();
				$('#hideButton').hide();
                $('#expandButton').click(function(){
                                         $('#' + expandContainer).show();
                                         $('#hideButton').show();
                                         $('#expandButton').hide();
                                      });
                
                $('#hideButton').click(function(){
                                         $('#' + expandContainer).hide();
                                         $('#hideButton').hide();
                                         $('#expandButton').show();
                                     });
            }
        };
        
        setExpand(metricsNumber);   
    };		 
}


// var metrics = {
// 	initialize: function (){
        
//         $('#logoutButton').click(utils.logout);
//         $('#home_button').click(function(){
//             //           utils.resetState();
//             window.location.href = 'metrics_available.html';
//         });
		
//         utils.addNextState();
//         utils.setNavigation();
// 		utils.setUserData();
// 		utils.setCurrentDate();
//         this.addAvailableMetrics();
// 		this.setMetricTabs();
// 	}, 
		
// 	setMetricTabs: function (){
// 		$('#availableMetricsTab').click( function() {
			
// 			if ($('#availableMetricsTab').hasClass('bg-tab-enabled')){
// 				return;
// 			}
			
// 			$('#availableMetricsTab').removeClass('bg-tab-disabled');
// 			$('#availableMetricsTab').addClass('bg-tab-enabled');
			
// 			$('#upcomingMetricsTab').removeClass('bg-tab-enabled');
// 			$('#upcomingMetricsTab').addClass('bg-tab-disabled');
			
// 			$("#packagesAvailableDiv").show();
// 	 	   	$("#upcomingMetricsAvailableDiv").hide();
			
// 			metrics.addAvailableMetrics()
// 		});
	    
// 		$('#upcomingMetricsTab').click( function () {
			
// 			if ($('#upcomingMetricsTab').hasClass('bg-tab-enabled')){
// 				return;
// 			}
			
// 			$('#upcomingMetricsTab').removeClass('bg-tab-disabled');
// 			$('#upcomingMetricsTab').addClass('bg-tab-enabled');
			
// 			$('#availableMetricsTab').removeClass('bg-tab-enabled');
// 			$('#availableMetricsTab').addClass('bg-tab-disabled');
			
// 		    $("#upcomingMetricsAvailableDiv").show();
// 		    $("#packagesAvailableDiv").hide();
			
// 			metrics.addUpcomingMetrics()		
// 		});
// 	},
	
// 	addAvailableMetrics: function () {
// 		utils.
//         $('#upcomingMetricsMasterDiv').hide();
//         $('#availableMetricsMasterDiv').show();
		
// 		$('#availableMetricsDiv').html('');
// 		$('#availableMetricsExpandDiv').html('');

// 		var metricsType = 'availableMetrics';
// 		var availableMetricsURL =  utils.baseServiceAddress() + 'Metrics/Available';
		
// 		metrics.addMetrics(metricsType, availableMetricsURL);
// 	},
	
// 	addUpcomingMetrics: function (){
        
//         $('#availableMetricsMasterDiv').hide();
//         $('#upcomingMetricsMasterDiv').show();
		
// 		$('#upcomingMetricsDiv').html('');
// 		$('#upcomingMetricsExpandDiv').html('');
		
        
// 		var metricsType = 'upcomingMetrics';
// 		var upcomingMetricsURL = utils.baseServiceAddress() + 'Metrics/Upcoming';
		
// 		metrics.addMetrics(metricsType, upcomingMetricsURL);
// 	},
	
    
//     addMetrics : function (metricsType, metricsTypeURL){
		
//         $('#expandButton').hide();
// 	    $('#hideButton').hide();
	   
// 		var authorizationCookie = utils.getAuthorizationCookie();
        
//         var metricsNumber = 0;
// 		var expandContainer = '';
        
//         $.ajax({
//                type: 'get',
// 			   beforeSend: function (request){
// 			     request.setRequestHeader('X-Token', authorizationCookie.Token);
// //                 request.setRequestHeader('Access-Control-Allow-Origin', '*');
// 			   },
//                dataType: 'json',
//                url: metricsTypeURL,
//                async: false,
//                success: function (data){
				   
	             
// 	               var container = 'availableMetricsDiv';
// 				   var masterContainer = 'availableMetricsMasterDiv';
			   
// 				   if(metricsType === 'availableMetrics'){
// 					   container = 'availableMetricsDiv';
// 					   masterContainer = 'availableMetricsMasterDiv';
// 				   }
// 				   else if(metricsType == 'upcomingMetrics'){
// 				   	   container = 'upcomingMetricsDiv';
// 					   masterContainer = 'upcomingMetricsMasterDiv';
// 				   }
				   
// 		           if(data == undefined || data.length == 0){
// 		               $('#unavailableMetricsDiv').show();
// 		               $('#' + masterContainer).hide();
// 					   $('#metricHeader').hide();
// 					   return;
// 		           }
// 				   else{
// 				   	    $('#unavailableMetricsDiv').hide();
// 					    $('#metricHeader').show();
// 				   }
               
// 	               var n = data.length;
// 	               metricsNumber = n;
				   
//                    var calculateAvailablePackages = function(){
//                    	   var availablePackagesCount = 0;
					   
// 					   for (var i = 0; i < n; ++i){
// 						   if(data[i].Status === 0 || data[i].Status === 1){
// 							   availablePackagesCount = availablePackagesCount + 1;
// 						   }
// 					   }
					   
// 					   $("#packagesAvailableSpan").html(availablePackagesCount);
//                    }
				   
// 				   var calcualteUpcomingMetrics = function(){
// 					   var upcomingMetricsCount = n;
// 					   $("#upcomingMetricsAvailableSpan").html(upcomingMetricsCount);
// 				   }
			   
// 				   if(metricsType === 'availableMetrics'){
// 					   calculateAvailablePackages();
// 				   }
// 				   else if(metricsType == 'upcomingMetrics'){
// 					   calcualteUpcomingMetrics();
// 				   }
               
			   
// 			       var firstMetricRowDiv = '<div class="metric-row bg-white"><div class="metric-row-status"><img id="statusImg" src="img/status_check.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-grey">GACH Last Wk of Program instrument Pkt (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-grey left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">10:00AM</div></div><div class="datebox-small bg-grey right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">11:00AM</div></div></div></div>';
    
// 			       var secondMetricRowDiv = '<div class="metric-row bg-light-grey"><div class="metric-row-status"><img id="statusImg" src="img/status_split.png" width="20" height="20"></div><div id="metricNameDiv" class="metric-row-msg txt-blue">Morbi dignissim tortor id ante varius ultricies (135 min)</div><div class="metric-date-container"><div class="datebox-small bg-green left"><div id="metricDateStartMonth" class="month-small">AUG</div><div id="metricDateStartDay" class="day-small">1</div><div id="metricDateStartTime" class="time-small">9:00AM</div></div><div class="datebox-small bg-green right"><div id="metricDateEndMonth" class="month-small">AUG</div><div id="metricDateEndDay" class="day-small">2</div><div id="metricDateEndTime" class="time-small">10:00PM</div></div></div></div>'
              
			   
// 				   for(var i = 0; i < data.length; ++i){
// 		                var metricObject = data[i].Data;
// 						var metricStatus = data[i].Status;
				
// 						if(i > 1){
// 							if(container == 'availableMetricsDiv'){
// 								container = 'availableMetricsExpandDiv';
// 								expandContainer = container;
// 							}
// 							else if(container == 'upcomingMetricsDiv'){
// 								container = 'upcomingMetricsExpandDiv';
// 								expandContainer = container;
// 							}
// 						}
				
// 		               if (i % 2 === 0){
// 		                  $('#' + container).append(firstMetricRowDiv);
// 		               }
// 		               else{
// 		                  $('#' + container).append(secondMetricRowDiv);
// 		               }
					   
// 					   $('#' + container + ' > div:last-child').attr('instrumentId', metricObject.EventID);
				   
// 				       // setStatusImg();
// 					   var setStatusImg = function (){
						   
// 						   var statusImg  = $('#' + container + ' > div:last-child #statusImg');
						   
// 						   if( metricStatus === 0){
// 							   statusImg.attr('src', 'img/status_empty.png');
// 						   }
// 						   else if (metricStatus === 1){
// 						   	   statusImg.attr('src', 'img/status_split.png');
// 						   }
// 						   else if (metricStatus === 2){
// 						   	   statusImg.attr('src', 'img/status_check.png');
// 						   }
// 						   else if (metricStatus === 3){
// 						   	   statusImg.attr('src', 'img/status_empty.png');
// 						   }
// 						   else if (metricStatus === 4){
// 						   	   statusImg.attr('src', 'img/status_empty.png');
// 						   }
// 					   }
					   
//                       setStatusImg();					  
// 	                  $('#' + container + ' > div:last-child #metricNameDiv').html(metricObject.GroupName);
           
// 	                  var startDateString = metricObject.StartDate;
// 					  var startDate = moment(startDateString);				   
        
// 	                  $('#' + container + ' > div:last-child #metricDateStartMonth').html(startDate.format("MMM").toLocaleUpperCase());
// 	                  $('#' + container + ' > div:last-child #metricDateStartDay').html(startDate.format("D"));
// 	                  $('#' + container + ' > div:last-child #metricDateStartTime').html(startDate.format("hh:ssA"));
           
// 	                  var endDateString = metricObject.EndDate;
// 	                  var endDate = moment(endDateString);	
               
//                       $('#' + container + ' > div:last-child').attr('expirationDate', endDateString);
           
// 	                  $('#' + container + ' > div:last-child #metricDateEndMonth').html(endDate.format("MMM").toLocaleUpperCase());
// 	                  $('#' + container + ' > div:last-child #metricDateEndDay').html(endDate.format("D"));
// 	                  $('#' + container + ' > div:last-child #metricDateEndTime').html(endDate.format("hh:mmA"));
//                }
			   
// 			   if(metricsType === 'availableMetrics'){
// 				       var navigate_to_metrics_summary = function (){
// 					   var instrumentId = $(this).attr('instrumentId');
// 	                   var expirationDate = $(this).attr('expirationDate');
// 	                   window.location.href = ('metrics_summary.html?instrumentId=' + instrumentId + '&expirationDate=' + expirationDate);
// 				   }
			   
// 	               $('#availableMetricsDiv > div').click(navigate_to_metrics_summary);
// 				   $('#availableMetricsExpandDiv > div').click(navigate_to_metrics_summary);
// 			   }			   

//                },
//                error: function (data){
//        				utils.redirectOnError();
//                }
//                });

        
//         var setExpand = function(metricsCount){
//             if(metricsCount < 3){
//                 $('#expandButton').hide();
// 				$('#hideButton').hide();
//             }
//             else{
// 				$('#expandButton').show();
// 				$('#hideButton').hide();
//                 $('#expandButton').click(function(){
//                                          $('#' + expandContainer).show();
//                                          $('#hideButton').show();
//                                          $('#expandButton').hide();
//                                       });
                
//                 $('#hideButton').click(function(){
//                                          $('#' + expandContainer).hide();
//                                          $('#hideButton').hide();
//                                          $('#expandButton').show();
//                                      });
//             }
//         };
        
//         setExpand(metricsNumber);   
//     }		
// }

// var metrics_summary = {
//     initialize : function()
//     {
//         $('#summary_list > div').click(function(){
//              window.location.href = 'metrics_form.html';
//                                        });
//     }
// }