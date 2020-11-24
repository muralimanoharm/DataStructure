import { Component } from '@angular/core';
import { Router, NavigationEnd ,Event, NavigationStart, NavigationCancel, NavigationError} from '@angular/router';
import { FormControl } from '@angular/forms';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent {

    nightScreen = new FormControl();
    loading = false;

    constructor(private router: Router) { 
        this.router.events.subscribe((event : Event)=>{
            switch(true){
                case event instanceof NavigationStart:{
                    this.loading = true;
                    break;
                }
                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError:{
                    this.loading = false;
                    break;
                }
                default: {
                    break;
                }
            }
        });
        
      }

    ngOnInit() {
        console.log('ngonit called twice');
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }
  
    GoToTop(){
      window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
    }
  
    NightMode(){
        //environment.nightScreen = this.nightScreen.value;
    }

}
