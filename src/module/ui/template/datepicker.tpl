<div ng-switch="view">
  <div ng-switch-when="date">
    <table>
      <thead>
      <tr>
        <th ng-click="prev()">&lsaquo;</th>
        <th colspan="5" class="switch" ng-click="setLastView()" ng-bind="date|date:'yyyy MMMM'"></th>
        <th ng-click="next()">&rsaquo;</i></th>
      </tr>
      <tr>
        <th ng-repeat="day in weekdays" style="overflow: hidden" ng-bind="day|date:'EEE'"></th>
      </tr>
      </thead>
      <tbody>
      <tr ng-repeat="week in weeks">
        <td ng-repeat="day in week">
          <button type="button" 
            ng-class="{'now':isNow(day),'active':isSameDay(day),'text-muted':(day.getMonth()!=date.getMonth()),'after':isAfter(day),'before':isBefore(day)}"
            ng-click="setDate(day)" ng-disabled="isDisabled(day)" ng-bind="day.getDate()"></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div ng-switch-when="year">
    <table>
      <thead>
      <tr>
        <th ng-click="prev(10)">&lsaquo;</th>
        <th colspan="5" class="switch" ng-bind="years[0].getFullYear()+' - '+years[years.length-1].getFullYear()"></th>
        <th ng-click="next(10)">&rsaquo;</i></th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td colspan="7">
          <button type="button" ng-class="{'active':isSameYear(year),'now':isNow(year)}"
                ng-repeat="year in years"
                ng-click="setDate(year)" ng-disabled="isDisabled(year)" ng-bind="year.getFullYear()"></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div ng-switch-when="month">
    <table>
      <thead>
      <tr>
        <th ng-click="prev()">&lsaquo;</th>
        <th colspan="5" class="switch" ng-click="setLastView()" ng-bind="date|date:'yyyy'"></th>
        <th ng-click="next()">&rsaquo;</i></th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td colspan="7">
          <button type="button" ng-repeat="month in months"
                ng-class="{'active':isSameMonth(month),'after':isAfter(month),'before':isBefore(month),'now':isNow(month)}"
                ng-click="setDate(month)"
                ng-bind="month|date:'MMM'" ng-disabled="isDisabled(month)" ></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div ng-switch-when="hours">
    <table>
      <thead>
      <tr>
        <th ng-click="prev(24)">&lsaquo;</th>
        <th colspan="5" class="switch" ng-click="setLastView()" ng-bind="date|date:'yyyy/MM/dd EEEE'"></th>
        <th ng-click="next(24)">&rsaquo;</i></th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td colspan="7">
          <button type="button" ng-repeat="hour in hours"
                ng-class="{'now':isNow(hour),'active':isSameHour(hour)}"
                ng-click="setDate(hour)" ng-disabled="isDisabled(hour)" ng-bind="hour|date:'HH'"></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div ng-switch-when="minutes">
    <table>
      <thead>
      <tr>
        <th ng-click="prev()">&lsaquo;</th>
        <th colspan="5" class="switch" ng-click="setLastView()" ng-bind="date|date:'yyyy/MM/dd EEEE'"></th>
        <th ng-click="next()">&rsaquo;</i></th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td colspan="7">
          <button type="button" ng-repeat="minute in minutes"
                ng-class="{active:isSameMinutes(minute),'now':isNow(minute)}"
                ng-click="setDate(minute)"
                ng-bind="minute|UITime" ng-disabled="isDisabled(minute)" ></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</div>