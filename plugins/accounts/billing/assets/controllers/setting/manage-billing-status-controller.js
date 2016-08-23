angular.module("EmmetBlue")

.controller("accountsBillingSettingManageBillingStatusController", function($scope, utils){
	var functions = {
		actionMarkups:{
			statusActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editStatus("+data.StatusID+")";
				var deleteButtonAction = "deleteStatus("+data.StatusID+")";

				var dataOpt = "data-option-id='"+data.StatusID+"' data-option-name='"+data.StatusName+"' data-option-description='"+data.StatusDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-status'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/transaction-status/view', 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New status',
			action: function(){
				$scope.newStatus = {};
				$("#new_setting_accounts_billing").modal("show");
			}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page'
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data'
        }
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('StatusName').withTitle("Status"),
		utils.DT.columnBuilder.newColumn('StatusDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.statusActionMarkup).withOption('width', '25%').notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editStatus = function(statusId){
		$scope.tempHolder.StatusName = $(".btn[data-option-id='"+statusId+"']").attr('data-option-name');
		$scope.tempHolder.StatusDescription = $(".btn[data-option-id='"+statusId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = statusId;

		console.log($scope.tempHolder);

		$("#edit_setting_accounts_billing").modal("show");
	}

	$scope.deleteStatus = function(statusId){
		var title = "Delete Prompt";
		var text = "You are about to delete the status named "+$(".btn[data-option-id='"+statusId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._statusId = statusId;
		var callback = function(){
			console.log($scope._statusId);
			var deleteRequest = utils.serverRequest('/accounts-biller/transaction-status/delete?'+utils.serializeParams({
				'resourceId': $scope._statusId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected status has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditStatus = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/accounts-biller/transaction-status/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_accounts_billing").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewStatus = function(){
		var data = $scope.newStatus;
		
		var request = utils.serverRequest('/accounts-biller/transaction-status/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully creaed a new status", "success", "notify");
			$("#new_setting_accounts_billing").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});