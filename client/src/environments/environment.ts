// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyDmTls6a24Xy4L-EZ5OrI8yi7HyFZJd0u0",
    authDomain: "sandbox-aymatic.firebaseapp.com",
    databaseURL: "https://sandbox-aymatic.firebaseio.com",
    projectId: "sandbox-aymatic",
    storageBucket: "sandbox-aymatic.appspot.com",
    messagingSenderId: "974843583143"
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
