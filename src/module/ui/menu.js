'use strict';

angular.module('module')

.factory('UIMenu', function($q , $location , $rootScope) {

	var menuData = [],
		nodeTree = [],
		nodeMap  = {},
		routePathToNodeId = {};

	var NodeState = (function(){
		var unfoldNodeIds = [];

		return {
			isUnfold : function(node){
				return node && node.id && unfoldNodeIds.indexOf(node.id)>-1;
			},
			unfold : function(node){
	        	if(unfoldNodeIds[0] == node.id){
	        		//已经为当前node不作为
	        		return;
	        	}
	        	//展开:
	        	//0. 清空记录的已展开数据
	        	unfoldNodeIds = [];
	        	//1. 展开自身
	        	unfoldNodeIds.push(node.id);
	        	//2. 如不为顶层 则展开所有父级直至顶层
	        	var parentNode , parentId = node.parentId;
	        	while(parentId && (parentNode = nodeMap[parentId])){
	        		unfoldNodeIds.push(parentId);
	        		parentId = parentNode.parentId;
	        	}
	        	//console.log("unfoldNodeIds",unfoldNodeIds);
	        },
	        fold : function(node){
	        	//如果有父级 则设置父级为current
	        	var parentNode;
	        	if(node.parentId && (parentNode = nodeMap[node.parentId])){
	        		NodeState.unfold(parentNode);
	        	}else{
	        		unfoldNodeIds = [];
	        	}
	        },
	        update : function(){

	        	if(!$location.path()){
					return;
				}
				var nodeId = routePathToNodeId[$location.path()] || null;
				var node;
				if(nodeId && (node = nodeMap[nodeId])){
					NodeState.unfold(node);
				}
				//console.log($location.path() , node);
			},
			reset : function(){
				unfoldNodeIds = [];
				NodeState.update();
			},
			clear : function(){
				unfoldNodeIds = [];
			}
		};
	})();



	var Node = function(node){
		this.node = node;
		this.id   = node.id;
		this.url  = node.url;
		this.title = node.title;
		this.parentId = node.parentId;
	};
	Node.prototype = {
		isParent : function(){
			return this.node && this.node.children && this.node.children.length > 0;
		},
		isChild : function(){
            return this.node && !this.isParent();
        },
        getChildren : function(){
            return this.node.children || null;
        },
        isUnfold : function(){
        	return NodeState.isUnfold(this.node);
        },
        toggleUnfold : function(){
        	NodeState.isUnfold(this.node) ? NodeState.fold(this.node) : NodeState.unfold(this.node);
        }
	};


	var scanChildren = function(children , parentId){

		var nodeMap = {} , routePathToNodeId = {};
		var nodeTree = children.map(function(item){
			item = angular.copy(item);
			if(parentId){
				item.parentId = parentId;
			}
			if(item.children && item.children.length > 0){
				var res = scanChildren(item.children , item.id);
				item.children = res[0];
				angular.extend(nodeMap, res[1]);
				angular.extend(routePathToNodeId, res[2]);
	    	}
	    	if(item.url && item.url.indexOf("http://")==-1 && item.url.indexOf("https://")==-1){
	    		//注意执行顺序
	    		if(item.url[0]!="/"){
	    			item.url = "/"+item.url;
	    		}
	    		routePathToNodeId[item.url] = item.id;
	    		item.url = "#"+item.url;
	    	}
	    	nodeMap[item.id] = new Node(item);
	    	return nodeMap[item.id];
		});
		return [nodeTree , nodeMap , routePathToNodeId];
	} ;


	var Menu = {

		reset : function(data){
			if(!data){
				return;
			}
			var currentMenuData = angular.copy(data);
			if(!angular.equals(currentMenuData, menuData)){
				menuData = currentMenuData;
				var res = scanChildren(menuData);
				nodeTree = res[0],
				nodeMap  = res[1],
				routePathToNodeId = res[2],
				NodeState.reset();
			}
		},

		getAll : function(){
			return nodeTree;
		},

		getById : function(id){
			return nodeMap[id] || null;
		}

	};

	$rootScope.$on('$locationChangeSuccess', NodeState.update);

	return Menu;
})

.directive('uiMenu', ['$compile' , 'UIMenu' , function ($compile , UIMenu) {
	return {
		restrict: "AE",
		templateUrl : 'module/ui/template/menu.tpl',
		replace: true,
		scope : {rootData : '=' , childrenData : '='},
		compile : function(tElement, tAttr, transclude) {

			var contents = tElement.contents().remove();
			var compiledContents;
			return function PostLinkingFunction (scope, element, attrs) {

				if(!compiledContents) {
                    compiledContents = $compile(contents, transclude);
                }

				scope.$watch(function(){
					return scope['rootData'] || null;
				}, function(data){
					if(data==null){
						return;
					}
					// console.log("contents" ,element[0]);
	                UIMenu.reset(data);
			      	scope['uiMenuNodes'] = UIMenu.getAll();
	                compiledContents(scope, function(clone, scope) {
	                    element.empty().append(clone);
	            	});
				},true);

				scope.$watch(function(){
					return scope['childrenData'] || null;
				} , function(data){
					if(data==null){
						return;
					}
			      	scope['uiMenuNodes'] = data;
	                compiledContents(scope, function(clone, scope) {
                        element.empty().append(clone);
                	});
				},true);	

			}
		}
	};
}])