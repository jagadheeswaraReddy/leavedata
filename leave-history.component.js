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
var index_1 = require('../_models/index');
var leave_transaction_service_1 = require("../_services/leave-transaction.service");
var api_1 = require("primeng/components/common/api");
var leave_type_service_1 = require("../_services/leave-type.service");
var moment = require('moment');
require("rxjs/add/operator/takeWhile");
var LeaveHistoryComponent = (function () {
    function LeaveHistoryComponent(ltService, leaveTypeService, confirmationService) {
        this.ltService = ltService;
        this.leaveTypeService = leaveTypeService;
        this.confirmationService = confirmationService;
        this.leaveTypes = [];
        this.daysRemaining = 0;
        this.showDialog = false;
        this.cancellable = false;
        this.alive = true;
    }
    LeaveHistoryComponent.prototype.ngOnDestroy = function () {
        this.alive = false;
    };
    LeaveHistoryComponent.prototype.ngOnInit = function () {
        this.refresh();
    };
    LeaveHistoryComponent.prototype.refresh = function () {
        var _this = this;
        this.waiting = true;
        this.leaveTypeService.getAll().takeWhile(function () { return _this.alive; }).subscribe(function (leaveTypes) {
            if (leaveTypes) {
                for (var _i = 0, leaveTypes_1 = leaveTypes; _i < leaveTypes_1.length; _i++) {
                    var lt = leaveTypes_1[_i];
                    _this.leaveTypes[lt.id] = lt;
                }
                _this.ltService.getLeaveHistoryByUserId(JSON.parse(localStorage.getItem('currentUser')).id).takeWhile(function () { return _this.alive; }).subscribe(function (data) {
                    _this.msgs = [];
                    _this.leaves = [];
                    if (data == null) {
                        _this.msgs = [];
                        _this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Server error: Unable to retrieve' });
                        return;
                    }
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var d = data_1[_i];
                        _this.leaves.push(new index_1.LeaveTransaction(d.id, d.isDeleted, d.createdBy, d.creationTime, d.lastModifiedBy, d.lastModifiedTime, d.applicationDate, d.startDateTime, d.endDateTime, d.yearlyLeaveBalance, d.numberOfDays, d.reason, d.leaveTypeId, d.employeeId, d.taskId, d.status, d.rejectReason, d.timings, d.sickLeaveAttachmentName, d.decisionToBeTaken, d.leaveRuleBean, d.decisionsBean, d.sickLeaveAttachment, d.calendarEventId, d.roleList, _this.leaveTypes[d['leaveTypeId']].name, d.username, d.userId, d.yearlyEntitlementId, d.employeeWorkEmailList, d.hrEmployeeWorkEmailList, d.employeeFullName, d.workEmailAddress));
                    }
                    _this.waiting = false;
                }, function (error) {
                    _this.msgs = [];
                    _this.msgs.push({ severity: 'error', summary: 'Error', detail: error });
                    _this.waiting = false;
                });
            }
            else {
                _this.msgs = [];
                _this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Server error: Unable to retrieve' });
                _this.waiting = false;
                return;
            }
        }, function (error) {
            _this.msgs = [];
            _this.msgs.push({ severity: 'error', summary: 'Error', detail: error });
            _this.waiting = false;
        });
    };
    LeaveHistoryComponent.prototype.onRowSelect = function (event) {
        this.showDialog = true;
        this.daysRemaining = moment(this.selectedLeave.startDateTime).diff(new Date().setHours(0, 0, 0, 0), 'days');
        this.cancellable = this.selectedLeave.status === 'Approved' && this.daysRemaining > 0 && this.selectedLeave.leaveTypeName !== 'Compassionate' && this.selectedLeave.leaveTypeName !== 'Sick' && this.selectedLeave.leaveTypeName !== 'Time-In-Lieu';
    };
    LeaveHistoryComponent.prototype.cancelLeave = function () {
        var _this = this;
        if (this.cancellable) {
            this.confirmationService.confirm({
                message: 'Are you sure that you want to delete the leave?',
                accept: function () {
                    _this.waiting = true;
                    _this.ltService.cancel(_this.selectedLeave).subscribe(function (success) {
                        _this.msgs = [];
                        _this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Leave has been cancelled successfully' });
                        _this.refresh();
                    }, function (error) {
                        _this.msgs = [];
                        _this.msgs.push({ severity: 'error', summary: 'Leave cancellation failed', detail: error });
                        _this.waiting = false;
                    });
                }
            });
        }
    };
    LeaveHistoryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'leave-history',
            templateUrl: 'leave-history.component.html',
        }), 
        __metadata('design:paramtypes', [leave_transaction_service_1.LeaveTransactionService, leave_type_service_1.LeaveTypeService, api_1.ConfirmationService])
    ], LeaveHistoryComponent);
    return LeaveHistoryComponent;
}());
exports.LeaveHistoryComponent = LeaveHistoryComponent;
//# sourceMappingURL=leave-history.component.js.map