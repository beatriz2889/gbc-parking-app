import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../shared/api.service";
import { DataService } from "../../shared/data.service";
import { Lot } from "../../shared/lot";
import { Spot } from "../../shared/spot";
import { Reservation } from "../../shared/reservation";
import { AuthService } from "../../shared/auth.service";

@Component({
    selector: "app-select-lot-time",
    templateUrl: "./select-lot-time.component.html",
    styleUrls: ["./select-lot-time.component.css"]
})
export class SelectLotTimeComponent implements OnInit {
    selectLotForm: FormGroup;
    lots: Lot[];
    reservation: Reservation;
    startTime: Date[] = new Array(25).fill(null);
    endTime: Date[] = [];
    today: Date;

    constructor(
        private apiService: ApiService,
        private dataService: DataService,
        private fb: FormBuilder,
        private router: Router,
        public authService: AuthService
    ) {}

    ngOnInit() {
        this.reservation = this.dataService.getReservation();
        this.today = new Date();
        this.lots = this.dataService.lots;
        this.selectLotForm = this.fb.group({
            lot_id: [this.lots[0].lot_id, [Validators.required]],
            start_time: ["", [Validators.required]],
            end_time: ["", [Validators.required]]
        });
        this.startTime.forEach((val, index, times) => {
            let minutes: number = 0;
            let hour: number = 8;
            if (index > 0) {
                minutes = times[index - 1].getMinutes() === 30 ? 0 : 30;
                hour =
                    times[index - 1].getMinutes() === 0
                        ? times[index - 1].getHours()
                        : times[index - 1].getHours() + 1;
            }
            times[index] = new Date(
                this.today.getFullYear(),
                this.today.getMonth(),
                this.today.getDate(),
                hour,
                minutes,
                0,
                0
            );
        });
        this.endTime = this.startTime.slice(1);
    }

    submitSelectLotForm() {
        if (this.selectLotForm.valid) {
            this.reservation.lot = new Lot();
            this.reservation.spot = new Spot();
            this.reservation.lot.lot_name = this.lots.find(lot => {
                return lot.lot_id === this.selectLotForm.get("lot_id").value;
            }).lot_name;
            this.reservation.start_time = this.selectLotForm.get(
                "start_time"
            ).value;
            this.reservation.end_time = this.selectLotForm.get(
                "end_time"
            ).value;
            this.reservation.lot.lot_id = this.selectLotForm.get(
                "lot_id"
            ).value;
            this.dataService.updateReservation(this.reservation);
            console.log(this.dataService.reservation);
            // Go to next page
            this.router.navigateByUrl("/select-spot");
        }
    }

    updateEndTime() {
        const timeIndex = this.startTime.findIndex(date => {
            return (
                date.toString() === this.selectLotForm.get("start_time").value
            );
        });
        this.endTime = this.startTime.slice(timeIndex + 1);
    }
}
