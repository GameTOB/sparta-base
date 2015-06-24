<ul class="nav">
	<li ng-repeat="node in uiMenuData" 
		ng-class="{active: uiMenuNodeSvc.isUnfold(node)}">
		<a href="{{node.url}}" ng-click="!node.url && uiMenuNodeSvc.toggleFold(node)">
			<span class="nav-label">{{node.title}} {{node.id}}</span>
			<span class="fa arrow" ng-if="uiMenuNodeSvc.isParent(node)"></span>
		</a>
		<div ui-menu ng-if="uiMenuNodeSvc.isParent(node)" children-data="uiMenuNodeSvc.getChildren(node)" ng-class="{in: uiMenuNodeSvc.isUnfold(node)}" class="collapse"></div>
	</li>
</ul>