import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { Toast } from '@ionic-native/toast';

/*
  Generated class for the BeaconProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export class BeaconModel {
  uuid: string;
  major: number;
  minor: number;
  rssi: number;
  
  constructor(public beacon: any) {
    this.uuid  = beacon.uuid;
    this.major = beacon.major;
    this.minor = beacon.minor;
    this.rssi  = beacon.rssi;
  }
}

@Injectable()
export class BeaconProvider {
  delegate: any;
  region: any;

  constructor(public http: HttpClient,
              public platform: Platform, 
              public events: Events,
              private ibeacon: IBeacon,
              private toast: Toast) {
    
  }

  /* toast message */
  alert(msg: string){
    this.toast.show(msg, '5000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );    
  }

  /* configure ibeacon plugin */
  initialise(): any {
    let promise = new Promise((resolve, reject) => {
      /* we need to be running on a device */
      if (this.platform.is('cordova')) {    
        /* Request permission to use location on iOS */
        this.ibeacon.requestAlwaysAuthorization();
        
        /* create a new delegate and register it with the native layer */
        this.delegate = this.ibeacon.Delegate();
        
        /* Subscribe to some of the delegate's event handlers */
        this.delegate.didRangeBeaconsInRegion().subscribe( data => {
          this.events.publish('didRangeBeaconsInRegion', data);
        }, error => 
          this.alert(error)
        );
        
        /* setup a beacon region – remove any special characters or else the plugin will not work.
          https://www.beautifyconverter.com/uuid-validator.php
        */
        this.region = this.ibeacon.BeaconRegion('deskBeacon', 'F7826DA6-ASDF-ASDF-8024-BC5B71E0893E');
        
        this.alert(`Scanning has started`);

        /* start ranging */
        this.ibeacon.startRangingBeaconsInRegion(this.region).then(() => {
          resolve(true);
        }, error => {
          this.alert(`Failed to begin monitoring: ${error}`);
          resolve(false);
        });
      } else {
        this.alert(`This application needs to be running on a device`);
        resolve(false);
      }
    });
    return promise;
  }
}
