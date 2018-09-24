"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var index_1 = require("../_services/index");
var LeaveBalanceChartListComponent = (function () {
    function LeaveBalanceChartListComponent(yeService, router) {
        this.yeService = yeService;
        this.router = router;
        this.header = "Your leave balance";
        this.yearlyEntitlements = [];
        this.displayLeaveDialog = false;
    }
    LeaveBalanceChartListComponent.prototype.ngOnInit = function () {
        this.yearlyEntitlements = this.yearlyEntitlements.filter(function (ye) { return ye.entitlement > 0; });
        this.displayLeaveDialog = false;
    };
    LeaveBalanceChartListComponent.prototype.onClickLeaveChart = function (leaveBal) {
        this.curLeaveBal = leaveBal;
        this.displayLeaveDialog = true;
    };
    LeaveBalanceChartListComponent.prototype.applyLeave = function () {
        if (this.curLeaveBal) {
            this.router.navigate(['/apply-leave', this.curLeaveBal.leaveType.id]);
            this.displayLeaveDialog = false;
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], LeaveBalanceChartListComponent.prototype, "yearlyEntitlements", void 0);
    LeaveBalanceChartListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'leave-list',
            templateUrl: 'leave-balance-chart-list.component.html'
        }), 
        __metadata('design:paramtypes', [index_1.YearlyEntitlementService, router_1.Router])
    ], LeaveBalanceChartListComponent);
    return LeaveBalanceChartListComponent;
}());
exports.LeaveBalanceChartListComponent = LeaveBalanceChartListComponent;
//# sourceMappingURL=leave-balance-chart-list.component.js.map