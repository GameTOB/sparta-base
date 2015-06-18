<div class="ui-alert state-{{data.stateClass}}">
<div class="modal-body" ng-if="data.message">
  <p>{{data.message}}</p>
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-{{data.stateClass}}" ng-click="ok()">{{data.resolveText}}</button>
</div>
</div>