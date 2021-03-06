angular.module("EmmetBlue")

.controller("accountsHMOCurrentInPatientsController", function($scope, utils){
	$scope.loadImage = utils.loadImage;

	function tableAction(data, type, full, meta){
		if (data.DischargeStatus == -1){
			var verifyButtonAction = "manageField('load', "+data.PatientAdmissionID+")";

			var dataOpt = "data-option-id='"+data.PatientAdmissionID;

			var verifyButton = "<button class='btn btn-danger btn-labeled bg-white no-border-radius btn-hmo-profile' ng-click=\""+verifyButtonAction+"\" "+dataOpt+"> <b><i class='icon-user-block'></i></b> Clear For Discharge</button>";
			
			var buttons = "<div class='btn-group'>"+verifyButton+"</button>";
			return buttons; //buttons;
		}

		return "";
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/hmo-in-patients/view?resourceId='+utils.userSession.getID(), 'GET');
		return request;
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

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn("PatientAdmissionID").withTitle("Ref. No."),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data){
			var image = $scope.loadImage(data.PatientInformation.patientpicture);
			var val = "<div class='media'>"+
						"<div class='media-left'>"+
							"<a href='#'>"+
								"<img src='"+image+"' class='img-circle img-lg' alt=''>"+
							"</a>"+
						"</div>"+

						"<div class='media-body' style='width: auto !important;'>"+
							"<h6 class='media-heading'>"+data.PatientInformation.patientfullname+"</h6>"+
							"<span class='text-muted'> "+data.PatientInformation.patienttypename+", "+data.PatientInformation.categoryname+"</span>"+
						"</div>"+
					"</div>";

			return "<div class='content-group'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Admission Date").renderWith(function(data, x, y){
			return "<p title='"+data.AdmissionDate+"'>"+new Date(data.AdmissionDate).toDateString()+"</p>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Ward").renderWith(function(data){
			var val = data.WardName+"<span>";

			val += "&nbsp;<span class='label label-info mb-5'> "+data.WardSectionName+"</span>"
			if (data.DischargeStatus == -1){
				val += "<span class='label label-danger display-block text-muted' title='Discharge Process Started'> Discharge In Progress</span>"
			}
			else if (data.DischargeStatus == 1){
				val += "<span class='label label-success display-block text-muted' title='The patient has been assigned a bed'> Discharged</span>"
			}

			return val+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageField = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "load":{
				var req = utils.serverRequest("/consultancy/patient-admission/clear-for-discharge?resourceId="+id, "GET");

				req.then(function(response){
					utils.notify("Discharge Complete", "This patient has been cleared successfully", "success");
					$scope.reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
});