'use strict';

angular.module('app')

.service('AppMenu', function(Api , APPCONF , $q) {
	
	var appApi = Api(APPCONF.APPKEY);
	var menuData = [];

	this.getData = function(){
		var deferred = $q.defer();

		if(menuData.length>0){
			deferred.resolve(menuData);
		}else{
			appApi.get("/menu/get").then(function(data){
				menuData = data;
				deferred.resolve(menuData);
			});
		}

		return deferred.promise;
	}

})

//还不成熟 不并入framework
.factory('Menu', function(AppMenu , $q , $location) {

	/**
	 * node : { id:[int] , expanded:[bool] , children:[] }
	 */

	var activedNodeIds = [];
	var activedLastNodeId = null;
	var flatNodesMap = {};
	var treeNodesArr = [];

	var pathToNodeIdMap = {};

	var NodeSvc = {
		//是父节点则必须有子节点 所以不存在 isParent && !hasChildren
        isParent : function(node){
            return node && node.children && node.children.length > 0;
        }, 
        //如果存在 children 属性，但长度为0 ，则也认为是子节点
        isChild : function(node){
            return node && !NodeSvc.isParent(node);
        },
        getChildren : function(node){
            return node.children || null;
        },
        isActive : function(node){
            return node && node.id && activedNodeIds.indexOf(node.id)>-1;
        },
        active : function(node){
        	//最后激活的ID没变化
        	if(activedLastNodeId==node.id){
        		return;
        	}
        	var currNode = node;
        	activedNodeIds = [];
        	activedLastNodeId = node.id;
        	do{
    			activedNodeIds.push(currNode.id);
        	}while(currNode = flatNodesMap[currNode.parentId])
        },
        toggleActive : function(node){
        	//如果当前node已经激活，则从父级开始激活(相当于变相关闭自己)
        	//console.log(NodeSvc.isActive(node) , node);
        	var currNode = NodeSvc.isActive(node) ? flatNodesMap[node.parentId] : node;
        	//console.log(currNode);
        	if(currNode){
        		NodeSvc.active(currNode);
        	}else{
        		//如果没有可用的node，则去除所有激活状态
        		activedNodeIds = [];
        		activedLastNodeId = null;
        	}
        }
	};

	var traversal = function(treeData , parentId){

		return treeData.map(function(item){
			item = angular.copy(item);
			if(parentId){
				item.parentId =  parentId;
			}
			if(item.children && item.children.length > 0){
				item.children = traversal(item.children , item.id);
				item.expanded = false;
	    	}
	    	if(item.url && item.url.indexOf("http://")==-1 && item.url.indexOf("https://")==-1){
	    		//注意执行顺序
	    		if(item.url[0]!="/"){
	    			item.url = "/"+item.url;
	    		}
	    		pathToNodeIdMap[item.url] = item.id;
	    		item.url = "#"+item.url;
	    	}
	    	flatNodesMap[item.id] = item;
	    	return item;
		});

	},setActivePath = function(path){
		var nodeId = pathToNodeIdMap[path];
		var node;
		//已经处于激活状态的 忽略
		if((node = flatNodesMap[nodeId]) && !NodeSvc.isActive(node)){
			//console.log("setActivePath" , node);
			NodeSvc.active(node);
		}
	};

	var Menu =  {
		getNodeSvc : function(){
			var deferred = $q.defer();

			Menu.getTreeData().then(function(){
				deferred.resolve(NodeSvc);
			});

			return deferred.promise;
		},
		getTreeData : function(){
			var deferred = $q.defer();
			if(treeNodesArr.length>0){
				deferred.resolve(treeNodesArr);
			}else{
				AppMenu.getData().then(function(treeData){
					treeNodesArr = traversal(treeData);
					//只做一次初始化active状态
					setActivePath($location.path());
					//console.log(treeNodesArr , flatNodesMap,treeData);
					deferred.resolve(treeNodesArr);
				});
			}
			return deferred.promise;
		}
	};
	return Menu;
});