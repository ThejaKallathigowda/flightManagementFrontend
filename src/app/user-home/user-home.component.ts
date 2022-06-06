import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../services/user.service";

@Component({
  selector: "app-user-home",
  templateUrl: "./user-home.component.html",
  styleUrls: ["./user-home.component.css"],
})
export class UserHomeComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) { }

  flights = null;
  notFound = null;
  found = false;
  userId = null;
  user = null;

  oneWay = false;
  roundTrip = false;

  departFlightNo=null;
  returnFlightNo=null;

  addbtn=true;

  type(val: String) {
    console.log(val);
    if (val.match('oneway')) {
      this.oneWay = true;
      this.roundTrip = false;
    }
    else if (val.match('roundtrip')) {
      this.oneWay = false;
      this.roundTrip = true
    }
    else { this.oneWay = false; }

  }




  /* flight search form */

  searchForm1 = this.formBuilder.group({
    arrivalAirport: [null, Validators.required],
    departureAirport: [null, Validators.required],
    departdate: [null, [ Validators.required,this.departDateValidator]],
    //type:[null, Validators.required]
   // departdate: [null, [ this.dateValidator]],
   // returndate: [null, [ this.dateValidator]]
  });

  searchForm2 = this.formBuilder.group({
    arrivalAirport: [null, Validators.required],
    departureAirport: [null, Validators.required],
    //date: [null, [ this.dateValidator]],
    //type:[null, Validators.required]
    departdate: [null, [ Validators.required,this.departDateValidator]],
    returndate: [null, [ Validators.required]]
  },{validators:this.returnDateValidator});

  ngOnInit(): void {
    this.userId = localStorage.getItem("userId");
    console.log(this.userId);
    if (this.userId == null) {
      this.router.navigate(["/error", "not logged in, login to continue"]);
    } else {
      this.userId = parseInt(this.userId);
      this.userService.getUser(this.userId).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          this.router.navigate(["/error", "not logged in, login to continue"]);
        }
      );
    }
  }

  back(){
    this.found=false;
  }
  /* ------method to search flight--------- */

  search() {

    if(this.oneWay){
      console.log(this.searchForm1.get("departdate").value);
    this.userService
      .searchFlight(
        this.searchForm1.get("departureAirport").value,
        this.searchForm1.get("arrivalAirport").value,
        this.searchForm1.get("departdate").value
      )
      .subscribe(
        (data) => {
          this.flights = data;
          console.log(this.flights);
          if (this.flights) {
            this.notFound = null;
            this.found = true;
          } else {
            this.notFound = "no flight found";
            this.found = false;
          }
        },
        (error) => {
          this.notFound =
           "no flights available from "+this.searchForm1.get("departureAirport").value+
           " to "+this.searchForm1.get("arrivalAirport").value +" for date "+this.searchForm1.get("departdate").value;
          this.found = false;
          
        }
      );
    
    }

    if(this.roundTrip){
      this.addbtn=false;
      console.log(this.searchForm2.get("departdate").value);
    this.userService
      .searchFlight(
        this.searchForm2.get("departureAirport").value,
        this.searchForm2.get("arrivalAirport").value,
        this.searchForm2.get("departdate").value
      )
      .subscribe(
        (data) => {
          this.flights = data;
          console.log(this.flights);
          if (this.flights) {
            this.notFound = null;
            this.found = true;
          } else {
            this.notFound = "no flight found";
            this.found = false;
          }
        },
        (error) => {
          this.notFound =
           "no flights available from "+this.searchForm2.get("departureAirport").value+
           " to "+this.searchForm2.get("arrivalAirport").value +" for date "+this.searchForm2.get("departdate").value;
          this.found = false;
          
        }
      );
    }
    
  }

  searchReturnflights(){

    if(this.roundTrip){
      this.addbtn=true;
      console.log(this.searchForm2.get("returndate").value);
    this.userService
      .searchFlight(
        this.searchForm2.get("arrivalAirport").value,
        this.searchForm2.get("departureAirport").value,
        this.searchForm2.get("returndate").value
      )
      .subscribe(
        (data) => {
          this.flights = data;
          console.log(this.flights);
          if (this.flights) {
            this.notFound = null;
            this.found = true;
          } else {
            this.notFound = "no flight found";
            this.found = false;
          }
        },
        (error) => {
          this.notFound =
           "no flights available from "+ this.searchForm2.get("arrivalAirport").value +
           " to "+this.searchForm2.get("departureAirport").value+" for date "+this.searchForm2.get("returndate").value +"choose one way Flight";
          this.found = false;
          
        }
      );
    }

  }
  searchTwoWayFlights(){
    console.log(this.searchForm2.get("returndate").value);
    console.log(this.searchForm2.get("departdate").value);
    this.userService
      .searchFlight2way(
        this.searchForm2.get("departureAirport").value,
        this.searchForm2.get("arrivalAirport").value,
        this.searchForm2.get("departdate").value,
        this.searchForm2.get("returndate").value
      ).subscribe(
        (data) => {
          this.flights = data;
          console.log(this.flights);
          if (this.flights) {
            this.notFound = null;
            this.found = true;
          } else {
            this.notFound = "no flight found";
            this.found = false;
          }
        },
        (error) => {
          this.notFound = "no flight found";
          this.found = false;
          alert("round trip booking is not possible for this way please choose oneway flight")
        }
      );
  }

  /* method to validate date */

  departDateValidator(control: AbstractControl) {
    //console.log("deop")
    const inputDate = new Date(control.value);
    const currentDate = new Date();

    if (inputDate <= currentDate) {
      return { dateError: true };
    }
    return null;
  }

  returnDateValidator(control: AbstractControl) {
    const depDate = control.get('departdate')
    const retDate=control.get('returndate')
    //console.log("ret")
    if (new Date(depDate.value) >= new Date(retDate.value)) {
      //console.log("err")
      return { arrivaldateError: true };
    }
    return null;
  }


  logout() {
    localStorage.removeItem("userId");
    this.router.navigate(["/userLogin"]);
  }

  getBookings() {
    this.router.navigate(["/getBookingByUser", this.userId]);
  }

  addPassengers(flightNo) {
    if(this.oneWay){
      this.router.navigate(["/addPassengers", flightNo]);
    }
    if(this.roundTrip){
      this.returnFlightNo=flightNo;
      console.log(this.departFlightNo);
      console.log("ss");
      this.router.navigate(["/addPassengers",this.departFlightNo, this.returnFlightNo]);
    }
    
  }

  selectReturnFlight(flightNo){

    this.departFlightNo=flightNo;
    this.found=false;
    this.searchReturnflights();
    

  }
}
