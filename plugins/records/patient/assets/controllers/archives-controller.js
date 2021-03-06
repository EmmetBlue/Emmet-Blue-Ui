angular.module("EmmetBlue")

.controller("recordsPatientArchivesController", function($scope, utils, recordsPatientWidgetFactory){
	$scope.showFullSearch = true;
	$scope.timelineData = {};
	$scope.searched = {};
	$scope.currentPatient = {};
	$scope.loadImage = utils.loadImage;
	$scope.getAge = utils.getAge;

	function loadTimeline(patientId){
		var timelineReq = recordsPatientWidgetFactory.loadTimeline(patientId);
		timelineReq.then(function(response){
			$scope.timelineData = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}

	function loadRepositories(patientId){
		var repoReq = recordsPatientWidgetFactory.loadRepositories(patientId);
		repoReq.then(function(response){
			$scope.repositoryData = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.search = function(){
		var query = $scope.searchQuery;

		var request = utils.serverRequest('/patients/patient/search?query='+query+'&size=50&from=0', "GET");

		request.then(function(response){
			$scope.searched.meta= response.hits;
			$scope.searched.patients = response.hits.hits;
		}, function(response){
			utils.errorHandler(response);
		})	
	}

	$scope.loadPatient = function(patient){
		$scope.currentPatient.name = patient["_source"].patientfullname;
		$scope.currentPatient.picture = $scope.loadImage(patient["_source"].patientpicture);
		$scope.currentPatient.id = patient["_source"].patientid;

		loadTimeline($scope.currentPatient.id);
		loadRepositories($scope.currentPatient.id);
	}
})
