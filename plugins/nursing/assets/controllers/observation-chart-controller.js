angular.module('EmmetBlue')

.controller('observationChartController', function($scope, utils){
	var functions = {
		actionMarkups: {
			observationChartActionMarkup: function (data, type, full, meta){
				var viewButtonAction = "manageObservationChart('view', "+data.ObservationChartID+")";
				var editButtonAction = "manageObservationChart('edit', "+data.ObservationChartID+")";
				var deleteButtonAction = "manageObservationChart('delete', "+data.ObservationChartID+")";

				var dataOpt = "data-option-id='"+data.ObservationChartID+"' data-option-patient-id='"+data.PatientID+"' data-option-staff-id='"+data.StaffID+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";
				var viewButton = "<button class='btn btn-default' ng-click=\""+viewButtonAction+"\" "+dataOpt+"> View</button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newObservationChartFieldCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new observation Chart Field", "success", "notify");
			$scope.newObservationChartField = {};
			$("#setting_new_observation_chart_field").modal("hide");

			$scope.reloadObservationChartTable();
		},
		observationChartFieldEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#setting_edit_observation_chart_field").modal("hide");

			$scope.reloadObservationChartTable();
		},
		observationChartDeleted: function(){
			utils.alert("Operation Successful", "The selected department groups have been deleted successfully", "success", "notify");
			$scope.tempHolder = {};
			delete  $scope._recordId;

			$scope.reloadObservationChartTable();
		},
		manageObservationChart: {
			newObservationChart: function(){
				$scope.loadObservationChartFormFields();
				$("#new_observation_chart_form").modal("show");
			},
			editObservationChart: function(observationChartId){
				$scope.loadObservationChartFormFields();

				$("#edit_observation_chart_form").modal("show");

				$scope.tempHolder.patientId = $(".btn[data-option-id='"+observationChartId+"']").attr('data-option-patient-id');
				$scope.tempHolder.staffId = $(".btn[data-option-id='"+observationChartId+"']").attr('data-option-staff-id');
				$scope.tempHolder.id = observationChartId;
				console.log($scope.tempHolder);
			},
			viewObservationChart: function(observationChartId){
				$scope.loadPatientObservationChartValues(observationChartId);
				$("#view_patient_observation_chart_details").modal("show");
			},
			deleteObservationChart: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the Observation Chart for this patient with ID "+$(".btn[data-option-id='"+id+"']").attr('data-option-patient-id')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._observationId = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/observation-chart/delete?'+utils.serializeParams({
						'resourceId': $scope._observationId
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.observationChartDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deleteAllSelectedObservationChart: function(){
				var selectedGroups = $scope.observationChartFieldSelector.selected;
				angular.forEach(selectedGroups, function(val, key){
					if (val){
						functions.manageObservationChartField.deleteObservationChartField(key);
					}
				})
			},
			ObservationChartFormField: function(){

			}
		}
	}

	$scope.tempHolder = {};

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/nursing/observation-chart/view', 'GET');
		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New Observations/Vital Signs',
			action: function(){
				functions.manageObservationChart.newObservationChart();
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		}
	]);	

	$scope.settingsDtColumns = [
		utils.DT.columnBuilder.newColumn('ObservationChartID').withTitle("Observation ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('PatientID').withTitle("Patient ID"),
		utils.DT.columnBuilder.newColumn('StaffID').withTitle("Staff ID"),
		/*utils.DT.columnBuilder.newColumn('FieldTitle').withTitle("Field Type"),
		utils.DT.columnBuilder.newColumn('FieldValue').withTitle('Value'),*/
		utils.DT.columnBuilder.newColumn('ObservationDate').withTitle('Date Collected'),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.observationChartActionMarkup).notSortable()
	];

	$scope.reloadObservationChartTable = function(){
		$scope.settingsDtInstance.reloadData();
	}
	$scope.loadObservationChartFormFields = function(){
		var sendForObservationChartFormFields = utils.serverRequest('/nursing/observation-chart-field-title/view', 'GET');

			sendForObservationChartFormFields.then(function(response){
				$scope.observationChartFormFields = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
	}
	$scope.loadPatientObservationChartValues = function(id){
		var resourceId =id;
		 var sendForObservationChartValues = utils.serverRequest('/nursing/observation-chart/view-observation-chart-field-values?resourceId='+id, 'GET');
			sendForObservationChartValues.then(function(response){
				$scope.observationChartvalues = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
	}

	$scope.observations = {};
	//$scope.observationChartFormFields = {};
	$scope.submitObservations = function(){
		var newObservationChartFieldValues = $scope.observations;
		newObservationChartFieldValues.patientId = 12;
		newObservationChartFieldValues.staffId ='eb47bc421e2cdb12e8f3';
		console.log($scope.observations);
		
		var saveNewObservationChartValues = utils.serverRequest('/nursing/observation-chart/new', 'POST', newObservationChartFieldValues);
		console.log(saveNewObservationChartValues)
		/*saveNewObservationChartField.then(function(response){
			console.log(response)
			functions.newObservationChartFieldCreated();
			$scope.newObservationChartField = {};
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});*/
	}

	$scope.saveEditObservationChart = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			FieldTitleName: $scope.tempHolder.name,
			FieldTitleType: $scope.tempHolder.type,
			FieldTitleDescription: $scope.tempHolder.description
		}
		var saveEdits = utils.serverRequest('/nursing/observation-chart-field-title/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.observationChartFieldEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageObservationChart = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageObservationChart.editObservationChart(id);
				break;
			}
			case "delete":{
				functions.manageObservationChart.deleteObservationChart(id);
				break;
			}
			case "view":{
				functions.manageObservationChart.viewObservationChart(id);
				break;
			}
			case "role-management":{
				functions.manageObservationChart.roleManagement(id);
				break;
			}
		}
	}
});