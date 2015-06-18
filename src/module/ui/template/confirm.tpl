<div class="ui-confirm state-{{data.stateClass}}">
<div class="modal-body" ng-if="data.message">
  <p>{{data.message}}</p>
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-{{data.stateClass}}" ng-click="ok()">{{data.resolveText}}</button>
  <button type="button" class="btn btn-default" ng-click="cancel()">{{data.rejectText}}</button>
</div>