import {Component, OnInit, OnDestroy}            from '@angular/core';

import { LeaveTransaction }                from '../_models/index';
import {LeaveTransactionService} from "../_services/leave-transaction.service";
import {Message, ConfirmationService} from "primeng/components/common/api";
import {LeaveTypeService} from "../_services/leave-type.service";
import {LeaveType} from "../_models/leave-type";
import * as moment from 'moment';
import "rxjs/add/operator/takeWhile";

@Component({
    moduleId: module.id,
    selector: 'leave-history',
    templateUrl: 'leave-history.component.html',
})
export class LeaveHistoryComponent implements OnInit, OnDestroy{
    waiting: boolean;
    msgs: Message[];
    leaves: any[];
    leaveTypes:LeaveType[] = [];
    selectedLeave: LeaveTransaction;
    daysRemaining = 0;
    showDialog: boolean = false;
    cancellable: boolean = false;

    private alive: boolean = true;
    ngOnDestroy(){
        this.alive = false;
    }

    constructor(private ltService : LeaveTransactionService, private leaveTypeService : LeaveTypeService, private confirmationService: ConfirmationService) {}
    ngOnInit(){
        this.refresh();
    }

    refresh(){
        this.waiting = true;
        this.leaveTypeService.getAll().takeWhile(()=>this.alive).subscribe(
            (leaveTypes:LeaveType[]) => {
                if(leaveTypes){
                    for(let lt of leaveTypes){
                        this.leaveTypes[lt.id] = lt;
                    }
                    this.ltService.getLeaveHistoryByUserId(JSON.parse(localStorage.getItem('currentUser')).id).takeWhile(()=>this.alive).subscribe(
                        data => {
                            this.msgs = [];
                            this.leaves = [];
                            if (data == null) {
                                this.msgs = [];
                                this.msgs.push({severity: 'error', summary: 'Error', detail: 'Server error: Unable to retrieve'});
                                return;
                            }
                            for (let d of data) {
                                this.leaves.push(
                                    new LeaveTransaction(
                                        d.id, d.isDeleted, d.createdBy, d.creationTime, d.lastModifiedBy, d.lastModifiedTime,
                                        d.applicationDate,
                                        d.startDateTime,
                                        d.endDateTime,
                                        d.yearlyLeaveBalance,
                                        d.numberOfDays,
                                        d.reason,
                                        d.leaveTypeId,
                                        d.employeeId,
                                        d.taskId,
                                        d.status,
                                        d.rejectReason,
                                        d.timings,
                                        d.sickLeaveAttachmentName,
                                        d.decisionToBeTaken,
                                        d.leaveRuleBean,
                                        d.decisionsBean,
                                        d.sickLeaveAttachment,
                                        d.calendarEventId,
                                        d.roleList,
                                        this.leaveTypes[d['leaveTypeId']].name,
                                        d.username,
                                        d.userId,
                                        d.yearlyEntitlementId,
                                        d.employeeWorkEmailList,
                                        d.hrEmployeeWorkEmailList,
                                        d.employeeFullName,
                                        d.workEmailAddress
                                    )
                                )
                            }
                            this.waiting = false;
                        },
                        error => {
                            this.msgs = [];
                            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
                            this.waiting = false;
                        }
                    );
                }else{
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: 'Error', detail: 'Server error: Unable to retrieve'});
                    this.waiting = false;
                    return;
                }
            },
            error => {
                this.msgs = [];
                this.msgs.push({severity: 'error', summary: 'Error', detail: error});
                this.waiting = false;
            }
        );
    }

    onRowSelect(event){
        this.showDialog = true;
        this.daysRemaining = moment(this.selectedLeave.startDateTime).diff(new Date().setHours(0,0,0,0), 'days');
        this.cancellable = this.selectedLeave.status === 'Approved' && this.daysRemaining > 0 && this.selectedLeave.leaveTypeName !== 'Compassionate' && this.selectedLeave.leaveTypeName !== 'Sick' && this.selectedLeave.leaveTypeName !== 'Time-In-Lieu';
    }

    cancelLeave(){
        if(this.cancellable){
            this.confirmationService.confirm({
                message: 'Are you sure that you want to delete the leave?',
                accept: () => {
                    this.waiting = true;
                    this.ltService.cancel(this.selectedLeave).subscribe(
                        success => {
                            this.msgs = [];
                            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Leave has been cancelled successfully'});
                            this.refresh();
                        },
                        error => {
                            this.msgs = [];
                            this.msgs.push({severity: 'error', summary: 'Leave cancellation failed', detail: error});
                            this.waiting = false;
                        }
                    );
                }
            });
        }
    }
}
