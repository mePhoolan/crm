import { Component } from '@angular/core';

@Component({
  selector: 'app',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  model: any = {
    county:"anne",
    market:"baltimore"
  };
 
 data={
   market:"baltimore",
   county:""
 }

  constructor(){

  }
  onSubmit() {
    alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.model))
  }

  changeMarket(e) {
    console.log(e.target.value)
    this.model.county=[]
  }
}
