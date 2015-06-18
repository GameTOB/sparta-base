<div id="wrapper" ng-controller="app.indexCtrl">
	<nav class="navbar-default navbar-static-side">
		<div class="sidebar-collapse">
			<h2>菜单</h2>
			<ul class="nav" id="side-menu">
				<li ng-repeat="node1st in menu.data" 
					ng-class="{active: menu.nodeSvc.isActive(node1st)}"
					todo="这里需要封成 menu"
					>
					<a href="{{node1st.url}}" ng-click="menu.nodeSvc.toggleActive(node1st)">
						<span class="nav-label">{{node1st.title}}</span>
						<span class="fa arrow" ng-if="menu.nodeSvc.isParent(node1st)"></span>
					</a>
					<ul class="nav nav-second-level collapse"
						ng-class="{in: menu.nodeSvc.isActive(node1st)}" 
						ng-if="menu.nodeSvc.isParent(node1st)">
						<li ng-repeat="node2nd in menu.nodeSvc.getChildren(node1st)" 
							ng-class="{active: menu.nodeSvc.isActive(node2nd)}">
							<a href="{{node2nd.url}}" ng-click="menu.nodeSvc.toggleActive(node2nd)">
							{{node2nd.title}}
							<span class="fa arrow" ng-if="menu.nodeSvc.isParent(node2nd)"></span>
							</a>
							<ul class="nav nav-third-level collapse"
							ng-class="{in: menu.nodeSvc.isActive(node2nd)}" 
							ng-if="menu.nodeSvc.isParent(node2nd)">
								<li ng-repeat="node3rd in menu.nodeSvc.getChildren(node2nd)" 
								><a href="{{node3rd.url}}">{{node3rd.title}}</a></li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
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