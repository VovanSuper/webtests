import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiIntercepter implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const headers = req.headers
    // .set('Content-Type', 'application/json');
    // const authReq = req.clone({ headers });
    let reqObj = {
      fullPath: req.urlWithParams,
      params: req.params
      , body: req.body
    }
    console.log(`Requesting: ${req.url} - ${req.method}`);
    if (req.method.toLowerCase() === 'post') {
      console.log(`[ApiIntercepter]:: ${JSON.stringify(reqObj)}`)

    }
    return next.handle(req);
  }
}