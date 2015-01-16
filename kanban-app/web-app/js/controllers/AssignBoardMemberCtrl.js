app.controller('AssignBoardMemberCtrl', ['$scope', '$timeout', 'BoardMemberService','UserService', function($scope, $timeout, BoardMemberService,UserService) {
	$scope.search = {};

	$scope.addBoardMember = function onAddBoardMember(memberId, role) {
		BoardMemberService.save($scope.boardInfo.id,{
			memberId: memberId,
			role: role
		}).then(function(resp){
			if(resp.success){
				$scope.members = $scope.members.findAndSet("userId",memberId,"boardRole", role);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member successfully added to the board");
			}
		});
	}

	$scope.updateBoardMemberRole = function onUpdateBoardMemberRole(memberId, role) {
		return BoardMemberService.update($scope.boardInfo.id,{
			memberId: memberId,
			role: role
		}).then(function(resp){
			if(resp.success){
				$scope.members = $scope.members.findAndSet("userId",memberId,"boardRole", role);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member successfully updated the role in the board");
			}
		});
	}

	$scope.removeBoardMember = function onRemoveBoardMember(memberId) {
		BoardMemberService.delete($scope.boardInfo.id,{ memberId: memberId})
		.then(function(resp){
			if(resp.success){
				$scope.members.findAndSet("userId",memberId,"boardRole", null);
				$scope.$broadcast("refreshMemberList");
				//console.log("Member removed from the board");
			}
		});
	}

	$scope.getAccessMatrix = function onGetAccessMatrix(projectRole, boardRole){
		return UserService.getAccessMatrix($scope.userInfo, projectRole, boardRole);
	}

	$scope.showManageMembers = function showManageMembers(){
		$scope.coyToggled = !$scope.coyToggled;
		$timeout(function(){
			$(".coy-members").css("display", $scope.coyToggled ? "block" : "none");
		}, 700);
	}

}]);
