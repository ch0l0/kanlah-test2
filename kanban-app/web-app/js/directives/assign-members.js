app.directive('assignMembers', ['$timeout','UserService', function($timeout, UserService) {
	var BOARD = "board",
		CARD = "card",
		boardRoleIcon = {
			template: "<a href='javascript:;' title='{0}' class='fa fa-user role-{1} member-role-icon {2}' nopopover='true'></a>",
			selector: "a.member-role-icon",
			parent: "a.member"
		}
	return {
	link: function(scope, element, attrs) {
		var $element = $(element[0]);

		function init(){
			var $projectlist = $(".coy-members .member-list", $element),
				$boardlist = $(".board-members .member-list", $element),
				draggableConfig = {
					cancel: "",
					revert: "invalid",
					containment: "document",
					helper: "clone",
					cursor: "move"
				}

			$( "li", $projectlist ).draggable(draggableConfig);
			$( "li:not([data-draggable='false'])", $boardlist ).draggable(draggableConfig);

			$projectlist.droppable({
				accept: ".board-members .member-list li",
				activeClass: "coy-members-highlight",
				drop: function(event,ui) {
					removeMember(ui.draggable, $projectlist);
				}
			});

			 $boardlist.droppable({
				accept: ".coy-members .member-list li",
				activeClass: "board-members-highlight",
				drop: function(event,ui) {
					addMember(ui.draggable, $boardlist, $projectlist);
				}
			});
			
			 //Assign to cards
			//makeCardsDroppable();

			var boardlistitems = $boardlist.find("li");
			$.each(boardlistitems, function(i, e){
				var mem = getMemberJson($(e));
				if(mem) addRoleIconOnAvatar($(e), mem);
			})
		}

		scope.$on("refreshMemberList", function(){
			scope.search.fullname = "";
			$timeout(init,250);
		});

		function addMember(item, destination, source) {
			var mem = getMemberJson(item);
			item.fadeOut(function() {
				var $list = $(destination).find("ul");
				item.appendTo($list).fadeIn(function(){
					$timeout(function(){
						if(attrs.assignMembers === BOARD) {
							scope.addBoardMember(mem.userId, mem.boardRole = mem.role);
						} else {
							scope.addCardMember(mem.id);
						}
					}, 0);
				});
			});
		}

		function removeMember(item, destination) {
			var mem = getMemberJson(item);
			item.fadeOut(function() {
				item.find(boardRoleIcon.selector).remove();

				item.appendTo(destination).fadeIn(function(){
					$timeout(function(){
						if(attrs.assignMembers === BOARD) {
							scope.removeBoardMember(mem.userId);
						} else {
							scope.removeCardMember(mem.id);
						}
					}, 0);
				});
			});
		}

		
		function addRoleIconOnAvatar(item, mem){
			var roleIconInfo = UserService.getAccessMatrix(scope.userInfo, mem.role,mem.boardRole); //getRoleIconInfo(mem.role,mem.boardRole, mem.boardRole);
			item.find(boardRoleIcon.selector).remove();
			if(roleIconInfo.board.assignRole){
				item.find(boardRoleIcon.parent).prepend(boardRoleIcon.template.format("Set as " + roleIconInfo.toggleRole, roleIconInfo.icon, "pointer")).end();
				item.find(boardRoleIcon.parent + ' > a').click(function(){
					scope.updateBoardMemberRole(mem.userId, mem.boardRole = roleIconInfo.toggleRole);
				});
			}else
				item.find(boardRoleIcon.parent).prepend(boardRoleIcon.template.format("Board " + mem.boardRole.toPascalCase(), roleIconInfo.icon, "")).end();
		}

		function getMemberJson(item){
			var $el = item.find(boardRoleIcon.parent),
				m = $el.attr("data-member");
			if(m) return JSON.parse(m ? m : {});
			return false;
		}

		/*Assign to Cards*/
		/*
		scope.$on("newCardCreated", function(){
			//$timeout(makeCardsDroppable,250);
		});

		function makeCardsDroppable(){
			$(".card-details:not(.ui-droppable)").droppable({
				accept: ".board-members .member-list li",
				activeClass: "coy-members-highlight",
				drop: function(event,ui) {
					assignMemberToCards($(ui.draggable).clone(), $(this).find(".card-assignee"))
				}
			});
		}

		function assignMemberToCards(item, destination){
			var itemId = item.find("a.member").attr("id"), isClone = false;

			$.each(destination.find("a.member"), function(i,e){
				if(e.id == itemId) return isClone = true;
			});
			if(isClone) return false;
			//item.find("a.member-role-icon" ).remove();
			item.appendTo(destination).fadeIn();
		}
		*/

		$timeout(init,250);
	}
	}
}]);