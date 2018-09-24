import { Component, OnInit, Input }            		from '@angular/core';
import { Router }                               from '@angular/router';

import { YearlyEntitlement}                    from '../_models/index';
import { YearlyEntitlementService }					 from "../_services/index";

@Component({
    moduleId: module.id,
    selector: 'leave-list',
    templateUrl: 'leave-balance-chart-list.component.html'
})
export class LeaveBalanceChartListComponent implements OnInit{
	header = "Your leave balance";
    @Input() yearlyEntitlements: YearlyEntitlement[] = [];
    curLeaveBal: YearlyEntitlement;

	displayLeaveDialog = false;

	constructor(private yeService:YearlyEntitlementService, private router: Router){}

    ngOnInit(){
        this.yearlyEntitlements = this.yearlyEntitlements.filter(ye=>ye.entitlement > 0);
		this.displayLeaveDialog = false;
    }

    public onClickLeaveChart(leaveBal: YearlyEntitlement) {
		this.curLeaveBal = leaveBal;
		this.displayLeaveDialog = true;
	}

	public applyLeave(){
	    if(this.curLeaveBal) {
            this.router.navigate(['/apply-leave', this.curLeaveBal.leaveType.id]);
            this.displayLeaveDialog = false;
        }
    }
}
