<div id="wrapper" ng-controller="app.indexCtrl">
	<nav class="navbar-default navbar-static-side">
		<div class="sidebar-collapse">
			<h2>菜单</h2>
			<div id="side-menu" ui-menu root-data="menuData"></div>
<!-- 			<ul class="nav" id="side-menu">
				<li ng-repeat="node1st in menu.data" 
					ng-class="{active: menu.NodeSvc.isUnfold(node1st)}"
					todo="这里需要封成 menu"
					>
					<a href="{{node1st.url}}" ng-click="!node1st.url && menu.NodeSvc.toggleFold(node1st)">
						<span class="nav-label">{{node1st.title}}</span>
						<span class="fa arrow" ng-if="menu.NodeSvc.isParent(node1st)"></span>
					</a>
					<ul class="nav nav-second-level collapse"
						ng-class="{in: menu.NodeSvc.isUnfold(node1st)}" 
						ng-if="menu.NodeSvc.isParent(node1st)">
						<li ng-repeat="node2nd in menu.NodeSvc.getChildren(node1st)" 
							ng-class="{active: menu.NodeSvc.isUnfold(node2nd)}">
							<a href="{{node2nd.url}}" ng-click="!node2nd.url && menu.NodeSvc.toggleFold(node2nd)">
							{{node2nd.title}}
							<span class="fa arrow" ng-if="menu.NodeSvc.isParent(node2nd)"></span>
							</a>
							<ul class="nav nav-third-level collapse"
							ng-class="{in: menu.NodeSvc.isUnfold(node2nd)}" 
							ng-if="menu.NodeSvc.isParent(node2nd)">
								<li ng-repeat="node3rd in menu.NodeSvc.getChildren(node2nd)"
									ng-class="{active: menu.NodeSvc.isUnfold(node3rd)}"
								><a href="{{node3rd.url}}">{{node3rd.title}}</a></li>
							</ul>
						</li>
					</ul>
				</li>
			</ul> -->
		</div>
	</nav>
	<div id="page-wrapper" class="gray-bg">
		<div class="row">
			<div class="col-lg-12">
				<div ng-view></div>
			</div>
		</div>
	</div>	
</div>