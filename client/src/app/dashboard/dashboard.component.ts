import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(public api: ApiService, private router: Router) { }

  user: any;
  pages;

  ngOnInit() {
    // let uid = localStorage.getItem('uid');
    this.user = JSON.parse(localStorage.getItem('user'));

    if (this.user) {
      // this.api.getUser(uid).subscribe(res => {
        this.getPages();
      // })
    } else {
      this.router.navigate(['/login'])
    }
  }

  page;
  selectedFile: File;

  selectFile(e) {
    console.log('File Selected ..!');
    console.dir(e[0]);
    this.selectedFile = e[0];
  }

  selectVal(e) {
    // if (!this.pages || this.pages.length === 0)
    //   this.getPages();
    // this.page = JSON.parse(e.target.value); 
    let sPage = JSON.parse(e.target.value);
    this.page = (<Array<{}>>this.pages).find(i => i['access_token'] == sPage['accessToken']);

    console.log(`dashboard->selectVal():: Selected Fb Page:: ${JSON.stringify(this.page)}`);

  }


  upload() {
    let form = new FormData();
    form.append('fbToken', this.user.fbLongToken);
    // form.append('fbId', this.user.fbId);
    form.append('fbPageId', this.page.id);
    form.append('fbUserId', localStorage.getItem('uid'));
    form.append('pageToken', this.page.access_token);
    form.append('pageName', this.page.name);
    form.append('email', this.user.email);
    form.append('photo', this.selectedFile, this.selectedFile.name);
    // this.api.uploader.onBuildItemForm = (fileItem: any, form: any) => {
    //   if (!this.page || !this.page.accessToken) throw `No page selected to post photo to`;
    //   console.dir(this.page);
    //   console.dir(this.user);
    //   form.append('fbToken', this.user.fbToken);
    //   // form.append('fbId', this.user.fbId);
    //   form.append('fbId', this.page.id);
    //   form.append('pageToken', this.page.access_token);
    //   form.append('email', this.user.email);
    // };
    // this.api.uploader.uploadAll();
    console.log(`UPLOADING FORM:::: `);
    console.dir(form);
    this.api.uploadFormSimple(form).subscribe(res => {
      let response = res && res.json();
      console.log(`Uploaded Photo to FB... :`);
      console.dir(response);
    },
      err => console.error(err)
    )
  }



  getPages() {
    this.api.getPages(this.user.fbId, this.user.fbLongToken).subscribe(pages => {
      this.pages = pages['data'];
      console.log(`dashboard->getPages():: pages - ${JSON.stringify(this.pages)}`);
    },
      err => console.error(err)
    )

  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login'])
  }

}
