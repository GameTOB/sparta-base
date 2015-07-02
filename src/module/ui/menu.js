'use strict';

angular.module('module')

/**
 * [UIMenu]
 * Notice : 不适用于增量变化的菜单 菜单数据需在UIMenu.init时全量设置完毕
 * Fixed: 
 *  - 15/6/30 同一个url对应多个node
 *  - 15/7/1  $location.path()引起unfold策略:采取按"/"分割后逐个缩短的策略查找对应node
 *            即 存在节点A的url为"/a/b"时 且不存在节点url为"/a/b/c" , 
 *            $location.path()为"/a/b/c"或"/a/b/c/:param" 均使节点A置为unfold
 *  - ...
 * 
 * return {
 * 		init:<function> return <Nodes>;
 * 		getAll:<function> return <Nodes>;
 * 		getById:<function> return <Node>;
 * }
 */
.factory('UIMenu', function($q , $location , $rootScope) {

	var menuData = [],
		nodeTree = [],
		nodeMap  = {};
		

	var UrlToNodes = (function(){
		/**
		 * [urlToNodes description]
		 * @type {Object}
		 * 
		 * {
		 * 	'/realtime/game':[1000,1010,1011] ,
		 *  '/realtime/total':[1100],
		 *  '/realtime/department':[1200,1210],
		 * }
		 */
		var store = {};

		return {
			set: function(url , node){
				if(store[url] && angular.isArray(store[url])){
					store[url].push(node);
				}else{
					store[url] = [node];
				}
			},
			get : function(url){
				return store[url] || null;
			}
		}
	})();

	var NodeState = (function(){
		var unfoldNodeIds = [];

		return {
			isUnfold : function(node){
				return node && node.id && unfoldNodeIds.indexOf(node.id)>-1;
			},
			unfold : function(nodes){
				if(!angular.isArray(nodes)){
					nodes = [nodes];
				}
				var comboNoedIds = [];
				var parentNode , parentId;
				
				nodes.forEach(function(node){
					if(comboNoedIds.indexOf(node.id)==-1){
						comboNoedIds.push(node.id);
					}
					parentId = node.parentId;
		        	while(parentId && (parentNode = nodeMap[parentId])){
		        		if(comboNoedIds.indexOf(parentNode.id)==-1){
							comboNoedIds.push(parentNode.id);
						}
		        		parentId = parentNode.parentId;
		        	}
				});
				unfoldNodeIds = comboNoedIds;
	        	//console.log("unfoldNodeIds",unfoldNodeIds);
	        },
	        fold : function(nodes){
	        	if(!angular.isArray(nodes)){
					nodes = [nodes];
				}
				var unfoldNodes = [];
				var parentNode;

				nodes.forEach(function(node){
					if(node.parentId && (parentNode = nodeMap[node.parentId])){
		        		unfoldNodes.push(parentNode);
		        	}
				});

				NodeState.unfold(unfoldNodes);
	        },
	        update : function(){

	        	if(!$location.path()){
					return;
				}
				var pathArr = $location.path().split("/");
				var path , nodes;
				while(pathArr.length>0){
					path = pathArr.join("/");
					nodes = UrlToNodes.get('#'+path);
					if(nodes && nodes.length>0){
						NodeState.unfold(nodes);
						break;
					}else{
						pathArr.pop();
					}
				}
			},
			init : function(){
				NodeState.clear();
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
		if(node.parentId){
			this.parentId = node.parentId;
		}
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

		var nodeMap = {};
		var nodeTree = children.map(function(item){
			item = angular.copy(item);
			if(parentId){
				item.parentId = parentId;
			}
			if(item.children && item.children.length > 0){
				var res = scanChildren(item.children , item.id);
				item.children = res[0];
				angular.extend(nodeMap, res[1]);
	    	}
	    	if(item.url && item.url.indexOf("http://")==-1 && item.url.indexOf("https://")==-1){
	    		//注意执行顺序
	    		if(item.url[0]!="/"){
	    			item.url = "/"+item.url;
	    		}
	    		item.url = "#"+item.url;
	    	}
	    	var node = new Node(item);
	    	nodeMap[item.id] = node;
	    	UrlToNodes.set(item.url , node);
	    	
	    	return node;
		});
		return [nodeTree , nodeMap];
	} ;


	var Menu = {

		init : function(data){
			if(!data){
				return [];
			}
			var currentMenuData = angular.copy(data);
			if(!angular.equals(currentMenuData, menuData)){
				menuData = currentMenuData;
				var res = scanChildren(menuData);
				nodeTree = res[0],
				nodeMap  = res[1];
				NodeState.init();
			}
			return nodeTree;
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
			      	scope['uiMenuNodes'] = UIMenu.init(data);
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