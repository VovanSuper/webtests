import { Component, NgZone } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import * as firebase from 'firebase';
// import { Http } from '@angular/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators/map'
// import { pipe } from '@angular/core/src/render3';
import { ApiService } from '../services/api/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  title = 'client';

  constructor(private zone: NgZone, private api: ApiService, private router: Router) { }



  userCreds;
  fbUser: any;
  firebaseUser;
  loginFb() {
    this.api.loginFb().then(res => {
      this.userCreds = res;
      this.fbUser = this.userCreds.additionalUserInfo.profile;
      this.firebaseUser = this.userCreds.user;
      //We have the Facebook ID of the user, time to make it LongLiveToken!
      this.api.getLongLiveToken(
        this.fbUser.id,
        this.userCreds.credential.accessToken,
        this.fbUser.email
      ).subscribe(resp => {
        //long LiveToken Created! Get pages
        console.log(`Login.cmp->loginFb():: LongTokFromSvc:: ${JSON.stringify(resp)}`);
        let longLiveToken = resp && resp.json()['token'];
        console.log(longLiveToken);
        localStorage.setItem('uid', this.firebaseUser.uid);
        localStorage.setItem('token', longLiveToken);
        // this.api.createUser(this.firebaseUser.uid, {
        let user = {
          fbToken: this.userCreds.credential.accessToken,
          fbLongToken: localStorage.getItem('token'),
          fbId: this.fbUser.id,
          name: this.fbUser.name,
          email: this.fbUser.email
        };
        localStorage.setItem('user', JSON.stringify(user));

        // })
        // .then(
        this.zone.run(() => this.router.navigate(['/dashboard']));
        //  this.api.getPages(this.fbUser.id, this.userCreds.credential.accessToken).subscribe(userCreds=>{
        //    //Now display these pages...
        //  })

      }, err => {
        console.error(err);
      })
    });

  }

}
