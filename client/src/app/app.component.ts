import { Component } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import * as firebase from 'firebase';
// import { Http } from '@angular/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators/map'
// import { pipe } from '@angular/core/src/render3';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';

  // constructor(private afAuth: AngularFireAuth, private http: Http) {
  // }

  // user = {
  //   email: '',
  //   password: ''
  // }

  // longLiveToken: any;


  // token = '';
  // uri = 'https://sandbox-aymatic.firebaseapp.com/__/auth/handler';
  // clientId = '2213536835598072';
  // secret = 'd2bb3b3c32251a57c6721489996b1668';


  // data;
  // fbUserId;

  // loginFb() {
  //   let provider = new firebase.auth.FacebookAuthProvider();
  //   this.afAuth.auth.signInWithPopup(provider).then(res => {
  //     console.log(res);
  //     this.data = res;
  //     console.log(this.data.credential.accessToken);
  //     this.token = this.data.credential.accessToken;
  //     this.createLongLiveToken(this.token, this.clientId, this.secret, this.uri).subscribe(resp => {
  //       console.log(resp);
  //       this.longLiveToken = resp.code;
  //       this.fbUserId = this.data.additionalUserInfo.profile.id
  //       console.log(`user ID is ${this.fbUserId}`)
  //       console.log(`LongLiveToken code is ${this.longLiveToken}`)
  //       this.getAccount(this.fbUserId, this.token);
  //       this.createPermanentToken(this.fbUserId, this.token).subscribe(response => {
  //         console.log(response.data[0]);


  //       }, err => {
  //         console.log(err);
  //       })
  //     }, error => {
  //       console.error(error);
  //     })

  //   }, err => {
  //     console.error(err);
  //   })

  // }


  // createLongLiveToken(token, clientId, secret, uri) {
  //   return this.http.get(`https://graph.facebook.com/oauth/client_code?access_token=${token}&client_secret=${secret}&redirect_uri=${uri}&client_id=${clientId}`)
  //     .pipe(map(this.extractData))
  // }

  // createPermanentToken(userId, longLiveToken) {
  //   return this.http.get(`http://graph.facebook.com/v3.2/${userId}/accounts?access_token=${longLiveToken}`)
  //     .pipe(map(this.extractData))
  // }



  // getAccount(userId, token) {
  //   return this.http.get(`http://graph.facebook.com/v3.2/me?access_token=${token}`)
  //     .pipe(map(this.extractData)).subscribe(res => {
  //       console.log(res);
  //     })
  // }


  // private extractData(res) {
  //   let body = res.json();
  //   return body;
  // }
  // private handleError(error: Response | any) {
  //   console.error(error.message || error);
  //   return Observable.throw(error.message || error);
  // }
}
