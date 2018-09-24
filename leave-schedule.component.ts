import { Component, OnInit, OnDestroy, Input }                    from '@angular/core';
import {YearlyEntitlement} from "../_models/index";
import { LeaveTypeService, YearlyEntitlementService, LeaveTransactionService, HolidayService} from "../_services/index";
import * as moment from 'moment';
import {Router} from "@angular/router";
import {LeaveType} from "../_models/leave-type";
import {ConfirmationService} from "primeng/components/common/api";
import "rxjs/add/operator/takeWhile";

@Component({
    selector: 'leave-schedule',
    templateUrl: 'app/leave-data/leave-schedule.component.html',
    styleUrls: ['app/_templates/dynamic-forms/df-question.component.css']
})
export class LeaveSchedule implements OnInit, OnDestroy{
    leaves: any[];
    header: any;

    displayDayDialog = false;
    displayEventDialog = false;
    selectedDate: Date;
    selectedEvent: any;

    leaveType: number;

    @Input() yearlyEntitlements: YearlyEntitlement[] = [];

    leaveTypes: string[] = [];

    leaveTypeOptions: any[];
    filteredLeaveTypeOptions: any[];
    leaveSelectFocus: boolean = false;

    daysRemaining: number;

    cancellable: boolean = false;

    private alive: boolean = true;
    ngOnDestroy(){
        this.alive = false;
    }

    constructor(private router: Router, private leaveTypeService: LeaveTypeService, private yeService: YearlyEntitlementService, private ltService: LeaveTransactionService, private holidayService: HolidayService, private confirmationService: ConfirmationService) {}

    ngOnInit(){
        this.leaveTypeService.getAll().takeWhile(()=>this.alive).subscribe(
            (lts:LeaveType[]) => {
                for(let lt of lts){
                    this.leaveTypes[lt.id] = lt.name;
                }
                var targetYe = [];

                this.leaveTypeOptions = [{label: '', value: null}];
                for(let ye of this.yearlyEntitlements){
                    if(ye.yearlyLeaveBalance > 0 || ye.entitlement === 0){
                        targetYe[ye.leaveType.id] = ye;
                        this.leaveTypeOptions.push({label: ye.leaveType.name, value: ye.leaveType.id});
                        if(ye.leaveType.name === 'Annual'){
                            targetYe[ye.leaveType.id] = ye;
                            this.leaveTypeOptions.push({label: 'Emergency', value: 999});
                        }
                    }
                }
                this.yearlyEntitlements = targetYe;
            }
        );
        this.leaves = [];
        this.ltService.getLeaveHistoryByUserId(JSON.parse(localStorage.getItem('currentUser')).id).subscribe(
            data => {
                for (let d of data) {
                    //TODO: Deal with coloring later
                    if(d.status == 'Approved'){
                        d.leaveTypeName = this.leaveTypes[d.leaveTypeId];
                        this.leaves.push({
                            title: this.leaveTypes[d.leaveTypeId],
                            start: moment(d.startDateTime).format("YYYY-MM-DD"),
                            end: moment(d.endDateTime).format("YYYY-MM-DD"),
                            leave: d
                        });
                    }
                }
            }
        );
        this.holidayService.getAll().subscribe(
            holidays => {
                for (let holiday of holidays) {
                    this.leaves.push({
                        title: holiday.holidayName,
                        start: moment(holiday.holidayDate).format('YYYY-MM-DD')
                    });
                }
            }
        );

        this.header = {
            left: 'prev,next today',
            center: 'title'
        };
    }

    handleDayClick(event): any {
        //TODO: Handle day click on allowed times, weekends, and public holidays server side
        this.selectedDate = new Date(event.date);
        let today = new Date();
        today.setHours(0,0,0,0); //Start of day
        if (this.selectedDate.getDay() !== 0 && this.selectedDate.getDay() !== 6) {
            if(this.selectedDate.getTime() >= today.getTime() + 86400000){
                this.filteredLeaveTypeOptions = this.leaveTypeOptions.filter(leaveType => leaveType.label !== 'Compassionate');
                if(this.selectedDate.getTime() >= today.getTime() + 432000000){
                    this.filteredLeaveTypeOptions = this.filteredLeaveTypeOptions.filter(leaveType => leaveType.label !== 'Emergency');
                }else{
                    this.filteredLeaveTypeOptions = this.filteredLeaveTypeOptions.filter(leaveType => leaveType.label !== 'Annual');
                }
            }else{
                this.filteredLeaveTypeOptions = this.leaveTypeOptions.filter(leaveType => leaveType.label !== 'Annual');
            }
            this.displayDayDialog = true;
        }
    }

    handleEventClick(e): any {
        if(e['calEvent']['leave']){
            this.selectedEvent = e['calEvent'];
            this.displayEventDialog = true;
            this.daysRemaining = moment(this.selectedEvent.start).diff(new Date().setHours(0,0,0,0), 'days');
            this.cancellable = this.selectedEvent.leave.status === 'Approved' && this.daysRemaining > 0 && this.selectedEvent.leave.leaveTypeName !== 'Compassionate' && this.selectedEvent.leave.leaveTypeName !== 'Sick' && this.selectedEvent.leave.leaveTypeName !== 'Time-In-Lieu';
        }
    }

    applyLeave() {
        this.router.navigate(['/apply-leave', this.leaveType, moment(this.selectedDate).format('YYYY-MM-DD')]);
        this.displayDayDialog = false;
    }

    cancelLeave(){
        if(!this.cancellable){
            return;
        }
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the leave?',
            accept: () => {
                this.ltService.cancel(this.selectedEvent.leave).subscribe(
                    success => {
                        location.reload();
                    }
                );
            }
        });

    }
}
