<ul class="nav">
	<li ng-repeat="node in uiMenuNodes" 
		ng-class="{active: node.isUnfold()}">
		<a href="{{node.url}}" ng-click="!node.url && node.toggleUnfold()">
			<span class="nav-label">{{node.title}}</span>
			<span class="fa arrow" ng-if="node.isParent()"></span>
		</a>
		<div ui-menu ng-if="node.isParent()" children-data="node.getChildren()" ng-class="{in: node.isUnfold()}" class="collapse"></div>
	</li>
</ul>