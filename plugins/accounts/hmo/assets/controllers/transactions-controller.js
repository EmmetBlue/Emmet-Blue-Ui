angular.module("EmmetBlue")
.controller("hmoTransactionsController", function($scope, utils, patientEventLogger){
	$scope.copyToClipboard = function(text) {
	    if (window.clipboardData && window.clipboardData.setData) {
	        // IE specific code path to prevent textarea being shown while dialog is visible.
	        return clipboardData.setData("Text", text); 

	    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
	        var textarea = document.createElement("textarea");
	        textarea.textContent = text;
	        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
	        document.body.appendChild(textarea);
	        textarea.select();
	        try {
	            document.execCommand("copy");  // Security exception may be thrown by some browsers.
	            utils.notify("Selected item copied successfully.", "", "info");
	        } catch (ex) {
	            utils.notify("Copy to clipboard failed.", ex, "error");
	            return false;
	        } finally {
	            document.body.removeChild(textarea);
	        }
	    }
	}

	$scope.requestFilter = {
		type: 'status',
		description: 'All Transactions',
		value: 1
	}

	$("option[status='disabled']").attr("disabled", "disabled");

	var functions = {
		actionsMarkUp: function(meta, full, data){
		},
		managePaymentRequest:{
			newAccountPaymentRequest: function(){
				$("#new_account_payment_request").modal("show");
			},
			paymentAccepted:function(){
				utils.alert("Operation Successful", "The selected Payment Request has been Accepted successfully", "success", "notify");
				$scope.dtInstance.reloadData();
			},
			paymentRequestDeleted:function(){
				utils.alert("Operation Successful", "The selected Payment Request has been deleted successfully", "success", "notify");
				$scope.dtInstance.reloadData();
			},
			verifyPaymentRequestForm:function(){
				$('#verify_payment').modal('show');
			},
			requestPaymentBill: function(id){
				$scope.temp = {
					requestId:id,
					requestNumber:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-payment-request-uuid"),
					staffUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-staff-id"),
					patientUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
					patientID:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-id"),
					patientFullName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
					patientType: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type"),
					patientCategoryName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-category-name"),
					patientTypeName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type-name"),
					requestDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-request-date"))).toDateString(),
					fulfillmentStatus: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfillment-status"),
					fulfilledDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-date"))).toDateString(),
					fulfilledBy: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-by"),
					deptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-department-name"),
					subDeptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-sub-dept-name")
				};
				$scope.paymentRequestBillingItems(id);
				$('#request_payment_bill').modal('show');
			},
			viewPaymentBill: function(id){
				$scope.temp = {
					requestId:id,
					requestNumber:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-payment-request-uuid"),
					staffUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-staff-id"),
					patientUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
					patientID:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-id"),
					patientFullName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
					patientType: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type"),
					patientCategoryName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-category-name"),
					patientTypeName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type-name"),
					requestDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-request-date"))).toDateString(),
					fulfillmentStatus: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfillment-status"),
					fulfilledDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-date"))).toDateString(),
					fulfilledBy: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-by"),
					deptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-department-name"),
					subDeptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-sub-dept-name")
				};

				$scope.paymentRequestBillingItems(id, false);
				$('#request_payment_bill').modal('show');
			},
			makePayment: function(edits){
				var title = "Request Payment Prompt";
				var text = "You are about to accept Payment from "+$(".btn-payment-request[data-option-id='"+edits.resourceId+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please ensure you have colected the Money from theis patient  and also note that this action cannot be undone";
				var close = true;
				$scope._id = edits.paymentRequestId;
				var callback = function(){
					var paymentRequest = utils.serverRequest('/accounts-biller/payment-request/makePayment','put',edits);

					paymentRequest.then(function(response){
						functions.managePaymentRequest.paymentAccepted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Accept Payment";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deletePaymentRequest: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete this payment request ID "+$(".btn-payment-request[data-option-id='"+id+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/accounts-biller/payment-request/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.managePaymentRequest.paymentRequestDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			}
		}
	}

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.loadRequests = function(){
		$scope.dtInstance.reloadData();
	}
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var url = '/accounts-biller/payment-request/load-all-requests?constantstatus=1&';
		var filter = $scope.requestFilter;
		var _filter = "";
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			_filter += 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1];
		}
		else if (filter.type == 'status'){
			_filter += 'filtertype=status&query='+filter.value;
		}
		else if (filter.type == 'patient'){
			_filter += 'filtertype=patient&query='+filter.value;
		}
		else if (filter.type == 'department'){
			_filter += 'filtertype=department&query='+filter.value;
		}
		else if (filter.type == 'staff'){
			_filter += 'filtertype=staff&query='+filter.staff;
			_filter += "&_date="+filter.date;

		}
		else if (filter.type == 'patienttype'){
			_filter += 'filtertype=patienttype&query='+filter.value;
		}

		$scope.currentRequestsFilter = _filter;
		var requests = utils.serverRequest(url+_filter, 'GET');
		return requests;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })
	.withButtons([
        {
        	//extend: 'new',
        	text: '<i class="icon-statistics"></i> <u>A</u>nalyse Current Data',
        	action: function(){
				if ($scope.requestFilter.type == "patient"){
					$scope.analysisFilters.status = [0, -1];
				}
				else if ($scope.requestFilter.type == "staff"){
					$scope.analysisFilters.status = [1];
					$scope.analysisFilters.dates = (new Date()).toLocaleDateString();
				}

				$scope.retriveAnalysisForCurrentTable();
				$("#show_analysis").modal("show");
        	}
        },
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Number").renderWith(function(data, full, meta){
			return "<p class='text-muted'>"+
					data.PaymentRequestUUID+
					"</p>"
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Attached Invoice").renderWith(function(data, full, meta){
			if (typeof data.AttachedInvoiceNumber !== "undefined"){
				var copyBtn = "<span class='copyButton'><a class='btn btn-icon btn-link btn-default no-bg no-border-radius btn-xs' ng-click='copyToClipboard("+data.AttachedInvoiceNumber+")'><i class='icon-copy2 text-primary'></i></a></span>";
				var string = "<p class='requestNum'>"+
								data.AttachedInvoiceNumber+
								copyBtn+
								"</p>";
			}
			else {
				var string ="<p class='text-muted'>&lt;no attached invoice&gt;</p>";
			}
			return string;
		}),
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Patient Name"),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Request Date").notVisible(),
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Date").renderWith(function(data, full, meta){
			var date = new Date(data.RequestDate);

			var val ='<span class="display-block">'+date.toDateString()+'</span><span class="text-muted">'+date.toLocaleTimeString()+'</span>';

			return val;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				var string = "<p class='no-border-radius label label-success label-lg'>Txn. Billed</p>";
			}
			else if(data.RequestFulfillmentStatus == -1) {
				var string = "<p class='label label-info label-lg'>Invoice Generated</p>";
			}
			else {
				var string = "<p class='no-border-radius label label-danger label-lg'>Unfulfilled</p>";
			}

			return "<h6>"+string+"</h6>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notVisible().renderWith(function(meta, full, data){ return data.PatientCategoryName+data.PatientTypeName; }),
		utils.DT.columnBuilder.newColumn("PatientTypeName").withTitle('Type')
	];

	$scope.paymentRequestBillingItems = function(paymentRequestId, acceptPayment){
		if (typeof(acceptPayment) === 'undefined') {
			acceptPayment = true;
		}
		
		var items = utils.serverRequest('/accounts-biller/payment-request/load-payment-request-billing-items?resourceId='+paymentRequestId,'get');
		items.then(function(response){
			$scope.itemsList = response;
			$scope.itemsList.globalTotal = 0;
			angular.forEach(response, function(value, key){
				$scope.itemsList.globalTotal += +value.totalPrice;
			})

			for(var i = 0; i < response.length; i++){
				response[i].itemName = response[i].BillingTypeItemName;
				response[i].itemCode = response[i].ItemID;
				response[i].itemPrice = response[i].totalPrice;
				response[i].itemQuantity = response[i].ItemQuantity;
			}

			var data = {
				type: $scope.temp.deptName,
				createdBy: utils.userSession.getUUID(),
				status: 'Payment Request',
				amount: response.globalTotal,
				items: response,
				patient: $scope.temp.patientID
			}

			if ($scope.temp.fulfillmentStatus == 0 && acceptPayment){
				var request = utils.serverRequest("/accounts-biller/transaction-meta/new", "POST", data);

				request.then(function(response){
					var lastInsertId = response.lastInsertId;

					if (lastInsertId){
						var edits = {
							AttachedInvoice: lastInsertId,
							RequestFulfillmentStatus: -1,
							resourceId: $scope.temp.requestId
						};

						utils.storage.currentInvoiceNumber = response.transactionNumber;

						if (acceptPayment){
							$("#request_payment_bill").modal("hide");
							$("#accept_new_payment").modal("show");

							utils.serverRequest("/accounts-biller/payment-request/edit?resourceId="+$scope.temp.requestId, "PUT", edits)
							.then(function(response){
								utils.notify("Info", "An invoice has been generated successfully for this payment request and request status has been updated", "success");
								$scope.reloadTable();
							}, function(error){
								utils.errorHandler(error);
							})
						}
					}
				}, function(responseObject){
					utils.errorHandler(responseObject);
				})
			}
		}, function(error){
			utils.errorHandler(error);
			utils.alert("Unable To Load Payment Form", "Please see the previous errors", "error");
		})
	}
	$scope.makePayment = function(){
		// var edits = {
		// 	resourceId : $scope.temp.requestId,
		// 	staffUUID : utils.userSession.getUUID(),
		// 	fulfilledDate: new Date(),
		// 	status: 1
		// }
		// functions.managePaymentRequest.makePayment(edits);
		// var eventLog = patientEventLogger.accounts.paymentRequestFulfilledEvent(
		// 	$scope.temp.patientID,
		// 	$scope.temp.requestId
		// );
		// eventLog.then(function(response){
		// 	//patient registered event logged
		// }, function(response){
		// 	utils.errorHandler(response);
		// });
		$scope.paymentRequestBillingItems($scope.temp.requestId);
	}
	$scope.verifyPayment = function(requestNumber){
		var request = utils.serverRequest('/accounts-biller/payment-request/get-status?resourceId&requestNumber='+requestNumber, 'GET');
		request.then(function(response){
			if (response.length < 1){
				utils.notify("An error occurred", "Seems like that payment request number does not exist or you have submitted an empty form, please try again", "warning");
			}
			else
			{
				if (response[0]["Status"] == 1){
					utils.alert("Verification successful", "The specified payment request has been fulfilled", "success");
				}
				else {
					utils.alert("Request Unfulfilled", "The specified payment request has not been fulfilled", "error");
				}
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}
	$scope.removeFromItemList = function(index, item){
		utils.alert("Operation not allowed", "You are not allowed to perform that action", "info");
	}

	$scope.functions = functions;

	function keepReloading(){
		setInterval(function(){
			$scope.reloadTable();
		}, 2000);
	}

	function loadDepartments(){
		var request = utils.serverRequest("/human-resources/department/view", "GET");
		request.then(function(result){
			$scope.departments = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}
	$scope.patientTypes = {};

	$scope.loadPatientTypes = function(){
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var requestData = utils.serverRequest("/accounts-biller/department-patient-types-report-link/view-by-staff?resourceId="+utils.userSession.getID(), "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	$scope.loadPatientTypes();
	loadDepartments();

	$scope.getDateRange = function(selector){
		var today = new Date();
		switch(selector){
			case "today":{
				return today.toLocaleDateString() + " - " + today.toLocaleDateString();
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1)).toLocaleDateString();
				return yesterday + " - " + yesterday;
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff)).toLocaleDateString() + " - " + today.toLocaleDateString();
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year + ' - ' + today.toLocaleDateString();
				break;
			}
		}
	}

	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "status":{
				if (selector.value !== null){
				$scope.requestFilter.type = "status";
					var value = selector.value.split("<seprator>");
					$scope.requestFilter.value = value[1];
					$scope.requestFilter.description = "Status: "+value[0];
					$scope.reloadTable();
				}
				break;
			}
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadTable();
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";
				$scope.reloadTable();
				break;
			}
			case "staff":{
				$scope.requestFilter.type = "staff";
				$scope.requestFilter.value= selector.value;
				if (typeof selector.date !== "undefined" && selector.date !== ""){
					$scope.requestFilter.date= selector.date;	
				}
				else {
					$scope.requestFilter.date = (new Date()).toLocaleDateString();
				}

				$scope.requestFilter.description = "Staff Search: '"+selector.value+"'";

				var req = utils.serverRequest("/human-resources/staff/get-staff-id?name="+selector.value, "GET");
				req.then(function(result){
					if (typeof result["StaffID"] !== "undefined"){
						$scope.requestFilter.staff = result["StaffID"];
						$scope.reloadTable();
					}
				})
				break;
			}
			case "department":{
				$scope.requestFilter.type = "department";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Department: '"+value[0]+"'";
				$scope.reloadTable();
				break;
			}
			case "patienttype":{
				$scope.requestFilter.type = "patienttype";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Patient Type: '"+value[0]+"'";
				$scope.reloadTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadTable();
			}
		}
	}

	$scope.currentFilterAnalysis = {};
	$scope.analysisFilters = {
	};

	$scope.retriveAnalysisForCurrentTable = function(){
		if (typeof ($scope.paymentRuleAppliedAmount) !== "undefined") {
			delete $scope.paymentRuleAppliedAmount;
		}

		var filter = $scope.currentRequestsFilter;
		var _filters = [];
		if (typeof $scope.analysisFilters.patienttype !== "undefined"){
			var string = "_patienttype="+$scope.analysisFilters.patienttype.join(",");
			_filters.push(string);
		}

		if (typeof $scope.analysisFilters.date !== "undefined"){
			var string = "_date="+$scope.analysisFilters.date;
			string.replace(" ", "");
			_filters.push(string)
		}

		if (typeof $scope.analysisFilters.department !== "undefined"){
			var string = "_department="+$scope.analysisFilters.department.join(",");
			_filters.push(string);
		}

		filter += "&"+_filters.join("&");
		var req = utils.serverRequest("/accounts-biller/payment-request/analyse-requests?constantstatus=1&"+filter, "GET");

		req.then(function(result){
			$scope.currentFilterAnalysis = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.applyPaymentRule = function(amount){
		utils.serverRequest("/patients/patient/search?query="+$scope.filterSelector.value, "GET").then(function(response){
			var id = response["hits"]["hits"][0]["_source"]["patientid"];

			var req = utils.serverRequest("/accounts-biller/get-item-price/apply-payment-rule?resourceId="+id+"&amount="+amount, "GET");

			req.then(function(response){
				$scope.paymentRuleAppliedAmount = response.amount;
			}, function(error){
				utils.errorHandler(error);
			})
		}, function(error){
			utils.errorHandler(error);
		})
	}
})