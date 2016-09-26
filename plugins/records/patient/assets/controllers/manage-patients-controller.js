angular.module("EmmetBlue")

.controller("recordsPatientManagePatientsController", function($scope, utils){
	$scope.utils = utils;
	$scope.disablers = {
		enable_camera: true,
		take_snapshot: false,
		snapshot_taken: false
	};
	$scope.statesInNigeria = {};
	$scope.lgasInState = {};
	$scope.patientTypes = {};
	$scope.patientCategories = {};

	utils.loadNigeriaData().then(function(response){
		$scope.statesInNigeria = response;
	}, function(response){
		utils.errorHandler(response);
	});

	$scope.loadLGAs = function(){
		var state = $scope.newPatient['State Of Origin'];
		for (var i = 0, numOfStates = ($scope.statesInNigeria).length; i < numOfStates; i++){
			if ($scope.statesInNigeria[i].state.name == state){
				$scope.lgasInState = $scope.statesInNigeria[i].state.locals;
				return;
			}
		}
	}

	$scope.loadPatientTypes = function(categoryId){
		var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
		requestData.then(function(response){
			$scope.patientTypes = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}


	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.$watch("patientCategory", function(newValue, oldValue){
		$scope.loadPatientTypes(newValue);
	})

	$scope.loadPatientCategories();
	$scope.loadPatientTypes();
	$scope.eDisablers = function(option){
		switch(option){
			case "enable":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
			case "take":{
				$scope.disablers.take_snapshot = false;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = true;
				break;
			}
			case "retake":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
		}
	}

	var self = this;

	  $scope.recordSubmitURL = "http://192.168.173.1/EmmetBlueApi/v1/patients/patient/new";


	  self.dropzoneConfig = {
	  	url: $scope.recordSubmitURL,
	  	autoDiscover: false,
	  	paramName: "file",
	    parallelUploads: 100,
	    dictDefaultMessage: 'Drop files here to upload <span>or CLICK</span>',
	    dictErrorMessage: 'An error has occurred, please try again',
	    maxFileSize: 30,
	    addRemoveLinks: true,
	    autoProcessQueue: false,
	    uploadMultiple: true,
	    MaxFiles: 20,
	    init: function() {
		        dzClosure = this;

		        $("#save-all").on("click", function(e) {
		            e.preventDefault();
		            e.stopPropagation();
		            dzClosure.processQueue();
		        });

		        this.on("sendingmultiple", function(data, xhr, formData) {
		        	$scope.newPatient.patientPassport = $("#passport").attr("src");
		        	angular.forEach($scope.newPatient, function(value, key){
		        		if (typeof value !== "string"){
		        			angular.forEach(value, function(val, k){
		        				angular.forEach(val, function(v, _k){
		        					formData.append(key+"_"+k+"_"+_k, v);
		        				})
		        			});
		        		}
		        		else
		        		{
		        			formData.append(key, value);
		        		}
		        	});
		        });

		        this.on("errormultiple", function(file, errorMessage, xhr){
	  				utils.alert("Error", "Unable to save record", "error")
		        })

		        this.on("successmultiple", function(file, errorMessage, xhr){
	  				
		        });

		        this.on("queuecomplete", function() {
				  dzClosure.removeAllFiles();
				});
		    }
	  };

	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest("/patients/patient/view", "GET");

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	});

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn("PatientUUID").withTitle("Patient Number").notVisible(),
		utils.DT.columnBuilder.newColumn("PatientFullName").withTitle("Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actionMarkup).notSortable()
	]

	function actionMarkup(data, type, full, meta){
		var list = "<ul class='icons-list text-nowrap'>"+
						"<li class='dropdown'>"+
							"<a href='#' class='dropdown-toggle' data-toggle='dropdown'><i class='icon-menu9'></i></a>"+

							"<ul class='dropdown-menu dropdown-menu-right'>"+
					        	"<li><a href='#' ng-click='loadPatientProfile("+data.PatientID+")'><i class='icon-user'></i> View Profile</a></li>"+
					        	"<li><a href='#'><i class='icon-cog'></i> Modify Profile</a></li>"+
							"</ul>"+
						"</li>"+
					"</ul>";

		return list;
	}

	$scope.dtInstance = {};
	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewPatient = function(){
		var patient = $scope.newPatient;

		var request = utils.serverRequest("/patients/patient/new", "POST", patient);

		request.then(function(response){
			utils.notify("Operation Successful", $scope.newPatient.firstName+" "+$scope.newPatient.lastName+"'s record has been saved successfully", "success");
			$scope.newPatient = {};
			$("#new_patient").modal("hide");
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.patientProfile = {};
	$scope.patientProfileMeta = {};
	$scope.profileSelected = false;
	$scope.loadPatientProfile = function(id){
		if (!$scope.profileSelected){
			$("#patientTable").removeClass("col-md-12").addClass("col-md-3");
			$scope.profileSelected = true;
		}
		var loadProfile = utils.serverRequest("/patients/patient/view?resourceId="+id, "GET");

		loadProfile.then(function(response){
			$scope.patientProfileMeta = response[0];
			delete response[0];
			$scope.patientProfile = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.newPatient = {};
	$scope.newPatient.hospitalHistory = [];
	$scope.newPatient.diagnosis = [];
	$scope.newPatient.operation = [];

	$scope.submitHospitalHistory = function(){
		$scope.newPatient.hospitalHistory.push($scope.hospitalHistory);
		$scope.hospitalHistory = {};
	}


	$scope.submitDiagnosis = function(){
		$scope.newPatient.diagnosis.push($scope.diagnosis);
		$scope.diagnosis = {};
	}

	$scope.submitOperation = function(){
		$scope.operation.diagnosisType="operation";
		$scope.newPatient.operation.push($scope.operation);
		$scope.operation = {};
	}

	$("#document").on("change", function(){
		$scope.documentUploaded();
	});

	$scope.documentUploaded = function(){
		var file = document.getElementById('document').files[0];
  		var reader = new FileReader();
  		reader.onloadend = function(e){
  			var data = e.target.result;
  			$scope.newPatient.documents = data;
  		}
  		reader.readAsDataURL(file);
	}
	
	$scope.submit = function(){
  		$scope.newPatient.patientPassport = $("#passport").attr("src");

  		var data = $scope.newPatient;
		data.patientName = $scope.newPatient['First Name'] + " " + $scope.newPatient['Last Name'];

		console.log(data);
		$('.loader').addClass('show');
  		var submitData = utils.serverRequest("/patients/patient/new", "POST", data);

  		submitData.then(function(response){
  			$('.loader').removeClass('show');
  			utils.alert("Info", "Record Uploaded successfully", "success");
			$scope.newPatient = {};
			$scope.newPatient.hospitalHistory = [];
			$scope.newPatient.diagnosis = [];
			$scope.newPatient.operation = [];

			$("#passport").attr("src", "plugins/records/patient/assets/images/passport-placeholder.png");
			$scope.eDisablers("enable");
			$("#new_patient").modal("hide");
			$("#patient_card").modal("show");
			console.log($scope.currentPatientCardData);
  		}, function(response){
  			$('.loader').removeClass('show');
  			utils.errorHandler(response);
  		})
	}

	$scope.searched = {};
	$scope.searched.searchIcon = "icon-search4";

	$scope.searched.pageSize = $scope.searched.pageSizeInc = 30;
	$scope.searched.currentPage = 0;
	$scope.searched.fromCounter = 0;

	function search(url){
		$scope.searched.searchIcon = "fa fa-spinner fa-spin";
		if ($scope.searched.pageSize < 1){
			$scope.searched.pageSize = $scope.searched.pageSizeInc = 30;
		}
		var size = $scope.searched.pageSize;
		var from = $scope.searched.fromCounter;
		var request = utils.serverRequest(url+'&size='+size+'&from='+from, "GET");

		request.then(function(response){
			$scope.searched.totalPageCount = response.hits.total;
			$scope.searched.patients = response.hits.hits;
			$scope.searched.searchIcon = "icon-search4";
		}, function(response){
			utils.errorHandler(response);
			$scope.searched.searchIcon = "icon-search4";
		})
	}

	$scope.pageChangeHandler = function(newPageNumber){
		$scope.searched.currentPage = newPageNumber;
		if (newPageNumber != 1)
		{
			$scope.searched.fromCounter = newPageNumber - 1 + ($scope.searched.pageSize * newPageNumber);
		}
		else
		{
			$scope.searched.fromCounter = 0;
		}
		$scope.search();
	}

	var loadPatients = function(){
		var request = utils.serverRequest("/patients/patient/view", "GET");

		request.then(function(response){
			$scope.searched.totalPageCount = response.hits.total;
			$scope.searched.patients = response.hits.hits;
		}, function(response){
			utils.errorHandler(response);
		})
	}
	loadPatients();

	$scope.search = function(newSearch = false){
		var query = $scope.search.query;

		if (newSearch){
			$scope.searched.fromCounter = 0;
		}

		search("/patients/patient/search?query="+query);
	}
})