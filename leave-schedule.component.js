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
var index_1 = require("../_services/index");
var moment = require('moment');
var router_1 = require("@angular/router");
var api_1 = require("primeng/components/common/api");
require("rxjs/add/operator/takeWhile");
var LeaveSchedule = (function () {
    function LeaveSchedule(router, leaveTypeService, yeService, ltService, holidayService, confirmationService) {
        this.router = router;
        this.leaveTypeService = leaveTypeService;
        this.yeService = yeService;
        this.ltService = ltService;
        this.holidayService = holidayService;
        this.confirmationService = confirmationService;
        this.displayDayDialog = false;
        this.displayEventDialog = false;
        this.yearlyEntitlements = [];
        this.leaveTypes = [];
        this.leaveSelectFocus = false;
        this.cancellable = false;
        this.alive = true;
    }
    LeaveSchedule.prototype.ngOnDestroy = function () {
        this.alive = false;
    };
    LeaveSchedule.prototype.ngOnInit = function () {
        var _this = this;
        this.leaveTypeService.getAll().takeWhile(function () { return _this.alive; }).subscribe(function (lts) {
            for (var _i = 0, lts_1 = lts; _i < lts_1.length; _i++) {
                var lt = lts_1[_i];
                _this.leaveTypes[lt.id] = lt.name;
            }
            var targetYe = [];
            _this.leaveTypeOptions = [{ label: '', value: null }];
            for (var _a = 0, _b = _this.yearlyEntitlements; _a < _b.length; _a++) {
                var ye = _b[_a];
                if (ye.yearlyLeaveBalance > 0 || ye.entitlement === 0) {
                    targetYe[ye.leaveType.id] = ye;
                    _this.leaveTypeOptions.push({ label: ye.leaveType.name, value: ye.leaveType.id });
                    if (ye.leaveType.name === 'Annual') {
                        targetYe[ye.leaveType.id] = ye;
                        _this.leaveTypeOptions.push({ label: 'Emergency', value: 999 });
                    }
                }
            }
            _this.yearlyEntitlements = targetYe;
        });
        this.leaves = [];
        this.ltService.getLeaveHistoryByUserId(JSON.parse(localStorage.getItem('currentUser')).id).subscribe(function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                //TODO: Deal with coloring later
                if (d.status == 'Approved') {
                    d.leaveTypeName = _this.leaveTypes[d.leaveTypeId];
                    _this.leaves.push({
                        title: _this.leaveTypes[d.leaveTypeId],
                        start: moment(d.startDateTime).format("YYYY-MM-DD"),
                        end: moment(d.endDateTime).format("YYYY-MM-DD"),
                        leave: d
                    });
                }
            }
        });
        this.holidayService.getAll().subscribe(function (holidays) {
            for (var _i = 0, holidays_1 = holidays; _i < holidays_1.length; _i++) {
                var holiday = holidays_1[_i];
                _this.leaves.push({
                    title: holiday.holidayName,
                    start: moment(holiday.holidayDate).format('YYYY-MM-DD')
                });
            }
        });
        this.header = {
            left: 'prev,next today',
            center: 'title'
        };
    };
    LeaveSchedule.prototype.handleDayClick = function (event) {
        //TODO: Handle day click on allowed times, weekends, and public holidays server side
        this.selectedDate = new Date(event.date);
        var today = new Date();
        today.setHours(0, 0, 0, 0); //Start of day
        if (this.selectedDate.getDay() !== 0 && this.selectedDate.getDay() !== 6) {
            if (this.selectedDate.getTime() >= today.getTime() + 86400000) {
                this.filteredLeaveTypeOptions = this.leaveTypeOptions.filter(function (leaveType) { return leaveType.label !== 'Compassionate'; });
                if (this.selectedDate.getTime() >= today.getTime() + 432000000) {
                    this.filteredLeaveTypeOptions = this.filteredLeaveTypeOptions.filter(function (leaveType) { return leaveType.label !== 'Emergency'; });
                }
                else {
                    this.filteredLeaveTypeOptions = this.filteredLeaveTypeOptions.filter(function (leaveType) { return leaveType.label !== 'Annual'; });
                }
            }
            else {
                this.filteredLeaveTypeOptions = this.leaveTypeOptions.filter(function (leaveType) { return leaveType.label !== 'Annual'; });
            }
            this.displayDayDialog = true;
        }
    };
    LeaveSchedule.prototype.handleEventClick = function (e) {
        if (e['calEvent']['leave']) {
            this.selectedEvent = e['calEvent'];
            this.displayEventDialog = true;
            this.daysRemaining = moment(this.selectedEvent.start).diff(new Date().setHours(0, 0, 0, 0), 'days');
            this.cancellable = this.selectedEvent.leave.status === 'Approved' && this.daysRemaining > 0 && this.selectedEvent.leave.leaveTypeName !== 'Compassionate' && this.selectedEvent.leave.leaveTypeName !== 'Sick' && this.selectedEvent.leave.leaveTypeName !== 'Time-In-Lieu';
        }
    };
    LeaveSchedule.prototype.applyLeave = function () {
        this.router.navigate(['/apply-leave', this.leaveType, moment(this.selectedDate).format('YYYY-MM-DD')]);
        this.displayDayDialog = false;
    };
    LeaveSchedule.prototype.cancelLeave = function () {
        var _this = this;
        if (!this.cancellable) {
            return;
        }
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the leave?',
            accept: function () {
                _this.ltService.cancel(_this.selectedEvent.leave).subscribe(function (success) {
                    location.reload();
                });
            }
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], LeaveSchedule.prototype, "yearlyEntitlements", void 0);
    LeaveSchedule = __decorate([
        core_1.Component({
            selector: 'leave-schedule',
            templateUrl: 'app/leave-data/leave-schedule.component.html',
            styleUrls: ['app/_templates/dynamic-forms/df-question.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router, index_1.LeaveTypeService, index_1.YearlyEntitlementService, index_1.LeaveTransactionService, index_1.HolidayService, api_1.ConfirmationService])
    ], LeaveSchedule);
    return LeaveSchedule;
}());
exports.LeaveSchedule = LeaveSchedule;
//# sourceMappingURL=leave-schedule.component.js.map