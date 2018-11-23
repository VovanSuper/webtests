import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { Http, ResponseType } from '@angular/http';
// import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators/map'
// import { pipe } from '@angular/core/src/render3';
import { AngularFirestore } from '@angular/fire/firestore';
// import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


const uploadURL = 'http://localhost:3000/api/upload';
const tokenURL = 'http://localhost:3000/api/get-token';
const graphBaseUrl = 'https://graph.facebook.com/v3.2';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // token = '';
  // uri = 'https://sandbox-aymatic.firebaseapp.com/__/auth/handler';
  // clientId = '2213536835598072';
  // secret = 'd2bb3b3c32251a57c6721489996b1668';
  // itemsRef: AngularFireList<any>;
  // items: Observable<any[]>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    // private afdb: AngularFireDatabase,
    private http: Http) {
    // this.itemsRef = afdb.list('UserData');
    // this.items = this.itemsRef.valueChanges();
  }


  public uploader: FileUploader = new FileUploader({ url: uploadURL, itemAlias: 'photo' });


  // uploadShit() {
  //   this.uploader.onAfterAddingFile = (file) => { file.withCredentials = true; };
  //   this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
  //     console.log('ImageUpload:uploaded:', item, status, response);
  //     alert('File uploaded successfully');
  //   };
  // }

  uploadFormSimple(form: any) {
    return this.http.post(uploadURL, form);
  }

  loginFb() {
    let provider = this.getFbProvider();
    provider.addScope('email');
    provider.addScope('publish_video');
    provider.addScope('manage_pages');
    provider.addScope('publish_pages');
    provider.addScope('pages_show_list');
    provider.addScope('read_insights');
    provider.addScope('ads_read');
    // provider.addScope('ads_management');
    return this.afAuth.auth.signInWithPopup(provider);
  }


  createUser(uid, data) {
    // await this.itemsRef.push(data);
    return this.afs.doc('users/' + uid).set(data);
  }

  getUser(uid) {
    return this.afs.doc('users/' + uid).valueChanges();
  }

  getLongLiveToken(userId, token, email) {
    // return this.http.get(`https://graph.facebook.com/oauth/client_code?access_token=${token}&client_secret=${this.secret}&redirect_uri=${this.uri}&client_id=${this.clientId}`)
    //   .pipe(map(this.extractData));
    // let localStoreToken = localStorage.getItem('token');
    // if (localStoreToken && localStoreToken.length > 0)
    //   return of(localStoreToken);
    return this.http.post(tokenURL, { userId, token, email });
  }

  getPages(facebookUserId, longLiveToken) {
    return this.http.get(`${graphBaseUrl}/${facebookUserId}/accounts?access_token=${longLiveToken}`)
      .pipe(
        map(this.extractData),
        catchError(this.handleError)
      )
  }


  private getFbProvider() {
    return new firebase.auth.FacebookAuthProvider();

  }

  private extractData(res) {
    let body = res.json();
    console.log(`User pages:: ${JSON.stringify(body)}`)
    return body;
  }

  private handleError(error: Response | any) {
    console.error(error.message || error);
    return throwError(error.message || error);
  }



}
