import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { UserService } from '../services/user.service';

@Component({
  selector: "app-add-passengers",
  templateUrl: "./add-passengers.component.html",
  styleUrls: ["./add-passengers.component.css"],
})
export class AddPassengersComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}


  booking1=null;
  booking2=null;
  message=null;
  userId = null;
  flightNumber = null;
  retFlightNo=null;

    /* ---passenger form group array---- */

  passengerArrayForm = this.formBuilder.group({
    passengers: this.formBuilder.array([this.addPassengerGroup()]),
  });





  ngOnInit(): void {
    this.userId = localStorage.getItem("userId");
    if (this.userId == null){
      this.router.navigate(["/error","login to continue..."]);
    } else {
      this.userId = parseInt(this.userId);
      this.route.paramMap.subscribe(
        (params:ParamMap) => {
          console.log(params);
          if(params.has('flightNumber1')){
            this.flightNumber = params.get("flightNumber1");
            this.retFlightNo = params.get("flightNumber2");
          }
          else{this.flightNumber = params.get("flightNumber");}
          
        }
      );
    }
  }

  /* ---method to create dynamic form group----- */

  addPassengerGroup() {
    return this.formBuilder.group({
      name: [null, [Validators.required]],
      age: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      gender: [
        null,
        [Validators.required],
      ],
    });
  }

  /* --getter for passengers------ */

  get passengerArray() {
    return <FormArray>this.passengerArrayForm.get("passengers");
  }


  /* -----method to add more passengers------ */

  addMorePassengers() {
    this.passengerArray.push(this.addPassengerGroup());
  }

  /* ----method to remove passengers---- */

  removePassenger(index) {
    this.passengerArray.removeAt(index);
  }


  offbutton=false;

  submit() {
    this.offbutton=true;
    if (this.passengerArray.length < 1){
      alert("no data provided");
    } else if(this.flightNumber == null){
      this.router.navigate(["/error","flight not provided"]);
    }
    else {
      this.flightNumber = parseInt(this.flightNumber);

      this.userService.addBooking(this.flightNumber,this.userId,this.passengerArrayForm.value).subscribe(
        (data) => {
          this.booking1=data;
          console.log(this.booking1)
        
          
         this.message="ticket booked successfully "
          //this.router.navigate(["/userHome"]);
        },
        error => {
          this.router.navigate(["/error","unable to add booking"]);
        }
      );
    }
    if(this.retFlightNo!=null){

      this.retFlightNo = parseInt(this.retFlightNo);

      this.userService.addBooking(this.retFlightNo,this.userId,this.passengerArrayForm.value).subscribe(
        (data) => {
          this.booking2=data;
          console.log(this.booking2)
        
          
          //this.message="return ticket booked successfully "
          //this.router.navigate(["/userHome"]);
        },
        error => {
          this.router.navigate(["/error","unable to add booking"]);
        }
      );

    }
  }
}
