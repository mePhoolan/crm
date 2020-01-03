import { Component } from '@angular/core';
import { FormBuilder, Validators,FormControl } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  isSubmitted = false;

  // City Names
  City: any = ['Florida', 'South Dakota', 'Tennessee', 'Michigan']

  CountyList:any={
    'Florida':['Florida1','Florida2','Florida3','Florida4'],
    'South Dakota':['South Dakota1','South Dakota2','South Dakota3'],
    'Tennessee':['Tennessee1','Tennessee2','Tennessee3'],
    'Michigan':[]
  }

  County:any=[]

  constructor(public fb: FormBuilder) { }

  /*########### Form ###########*/
  registrationForm = this.fb.group({
    cityName: ['', [Validators.required]],
    countyName: ['', [Validators.required]]
  })


  changeCity(e) {
   
    this.cityName.setValue(e.target.value, {
      onlySelf: true
    })
    this.County=this.CountyList[this.registrationForm.value.cityName]
  this.removeCountyName()
  }

  removeCountyName(){
       this.registrationForm.removeControl('countyName')
   this.registrationForm.addControl('countyName',new FormControl('', Validators.required))
  }



  changeCounty(e){
    this.countyName.setValue(e.target.value, {
      onlySelf: true
    })
  }
  
  getcountybyCity(value){

  }
  // Getter method to access formcontrols

  get previousSelectedCity() {
    return this.registrationForm.get('cityName');
  }

  get cityName() {
    return this.registrationForm.get('cityName');
  }

  get countyName() {
    return this.registrationForm.get('countyName');
  }

  /*########### Template Driven Form ###########*/
  onSubmit() {
    this.isSubmitted = true;
    if (!this.registrationForm.valid && !this.registrationForm.value.countyName) {
      return false;
    } else {
      alert(JSON.stringify(this.registrationForm.value))
    }

  }

}