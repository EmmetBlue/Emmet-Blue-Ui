angular.module("EmmetBlue")

.controller('labNewPatientController', function($scope, utils, patientEventLogger){
	$scope.patient = {};
	$scope.loadPatientProfile = function(){
		var patient = utils.serverRequest("/patients/patient/search", "POST", {
			"query":$scope.patientNumber,
			"from":0,
			"size":1
		});

		patient.then(function(response){
			var profile = response.hits.hits[0]["_source"];
			$scope.patient.firstName = profile["first name"];
			$scope.patient.lastName = profile["last name"];
			$scope.patient.gender = profile["gender"];
			$scope.patient.phoneNumber = profile["phone number"];
			$scope.patient.address = profile["home address"];
			$scope.patient.patientID = profile["patientid"];
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadLabs(){
		utils.serverRequest("/lab/lab/view", "GET").then(function(response){
			$scope.labs = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadLabs();

	$scope.investigationTypeArray = []
	$scope.$watch(function(){
		return $scope.patientLab;
	}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			utils.serverRequest("/lab/investigation-type/view-by-lab?resourceId="+newValue, "GET").then(function(response){
				$scope.investigationTypes = response;
				angular.forEach(response, function(value, key){
					$scope.investigationTypeArray[value.InvestigationTypeID] = value;
				})
			}, function(error){
				utils.errorHandler(error);
			});
		}		
	});

	$scope.savePatient = function(){
		var patient = $scope.patient;

		var result = utils.serverRequest("/lab/patient/new", "POST", patient);
		result.then(function(response){
			utils.alert("Operation successful", "New patient registered successfully", "success");
			$("#new_patient").modal("hide");
			$scope.$emit("reloadLabPatients", {});
			if (typeof $scope.patient.patientID !== "undefined"){
				var eventLog = patientEventLogger.lab.newPatientRegisteredEvent(
					$scope.patient.patientID,
					$scope.investigationTypeArray[$scope.patient.investigationTypeRequired].InvestigationTypeName, 
					response.lastInsertId
				);
				eventLog.then(function(response){
					//patient registered event logged
				}, function(response){
					utils.errorHandler(response);
				});
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}
});