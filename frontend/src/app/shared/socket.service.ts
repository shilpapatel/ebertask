import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, throwError } from 'rxjs';
import {
  HttpHeaders,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket;
  constructor() {
    this.socket = io('http://localhost:5000/');
  }

  // updateDriver(driverdata:any): void {
  //   this.socket.emit('updateDriver', driverdata);
  // }
  
  subscribeToListenDriverUpdate(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('driverUpdated', updatedDriver => {
        observer.next(updatedDriver);
      });
  
      return () => {
        this.socket.off('driverUpdated');
      };
    });
  }

updateType(driverId: string, driverType: string): void {
  this.socket.emit('updateDriverType', { driverId, driverType });
}

subscribeToListenDriverTypeUpdate(): Observable<any> {
  return new Observable<any>(observer => {
    this.socket.on('driverTypeUpdated', updatedDriverType => {
      observer.next(updatedDriverType);
    });

    return () => {
      this.socket.off('driverTypeUpdated');
    };
  });
}

  updateStatus(driverId: string, driverStatus: string): void {
    this.socket.emit('updateDriverStatus', { driverId, driverStatus });
  }

  subscribeToListenDriverStatusUpdate(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('driverStatusUpdated', updatedDriver => {
        observer.next(updatedDriver);
      });

      return () => {
        this.socket.off('driverStatusUpdated');
      };
    });
  }



  getDriversWithoutPage(): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.emit('getDriversWithoutPage');

      this.socket.on('driversAllData', (driversData) => {
        observer.next(driversData);
      });

      return () => {
        this.socket.off('driversAllData');
      };
    });
  }


  addDriverRide(driverrideData: any): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.emit('addDriverRide', driverrideData);

      this.socket.on('driverRideCreated', response => {
        observer.next(response);
      });

      this.socket.on('addDriverRideError', error => {
        observer.error(error);
      });

      return () => {
        // Clean up code when the observer is unsubscribed
        this.socket.off('driverRideCreated');
        this.socket.off('addDriverRideError');
      };
    });
  }
  getDriverRideData(): Observable<any> {

    return new Observable<any>((observer) => {
      this.socket.emit('getDriverRide');

      this.socket.on('driverRideData', (driverridedata) => {
        observer.next(driverridedata);
      });

      return () => {
        this.socket.off('driverRideData');
      };
    });
  }

  getDriverRideHistoryData(page: number, pageSize: number, searchQuery: string, sortField: string, sortOrder: string): Observable<any> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      searchQuery: searchQuery,
      sortField: sortField,
      sortOrder: sortOrder
    };
    return new Observable<any>((observer) => {
      this.socket.emit('getDriverRideHistory', params);
  
      this.socket.on('driverRideHistoryData', (driverridedata, totalPages, currentPage) => {
        observer.next({ driverridedata, totalPages, currentPage });
      });
  
      return () => {
        this.socket.off('driverRideHistoryData');
      };
    });
  }
  // getDriverRideData(page: number, pageSize: number, searchQuery: string, sortField: string, sortOrder: string): Observable<any> {
  //   const params = {
  //     page: page.toString(),
  //     pageSize: pageSize.toString(),
  //     searchQuery: searchQuery,
  //     sortField: sortField,
  //     sortOrder: sortOrder
  //   };
  //   return new Observable<any>((observer) => {
  //     this.socket.emit('getDriverRide', params);
  
  //     this.socket.on('driverRideData', (driverridedata, totalPages, currentPage) => {
  //       observer.next({ driverridedata, totalPages, currentPage });
  //     });
  
  //     return () => {
  //       this.socket.off('driverRideData');
  //     };
  //   });
  // }
  // updateDriverRide(driverrideId: string, driverId: string,assignedvalue:string): void {
  //   this.socket.emit('updatedriverride', {driverrideId, driverId ,assignedvalue});
  // }
  updateDriverRide(driverrideId: string, driverId: string,assignedvalue:string,created:string): void {
    this.socket.emit('updatedriverride', {driverrideId, driverId ,assignedvalue,created});
  }

  updateNearestDriverRide(driverrideId: string,driverdata:any,assignedvalue:string,created:string): void {
    this.socket.emit('updatenearestdriverride', {driverrideId,driverdata ,assignedvalue,created});
  }
  subscribeToListenDriverRideUpdate(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('driverrideupdated', updatedDriverRide => {
        observer.next(updatedDriverRide);
      });

      return () => {
        this.socket.off('driverrideupdated');
      };
    });
  }

  acceptDriverRide(driverrideId: string):void {
    this.socket.emit('acceptDriverRide', driverrideId);
  } 

  deleteDriverRide(driverrideId: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.emit('deleteDriverRide', driverrideId);

      this.socket.on('driverRideDeleted', response => {
        observer.next(response);
      });

      this.socket.on('deleteDriverRideError', error => {
        observer.error(error);
      });

      return () => {
        this.socket.off('driverRideDeleted');
        this.socket.off('deleteDriverRideError');
      };
    });
  }

  deleteConfirmRide(createrideId: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.emit('deleteConfirmRide', createrideId);

      // this.socket.on('driverRideDeleted', response => {
      //   observer.next(response);
      // });

      // this.socket.on('deleteDriverRideError', error => {
      //   observer.error(error);
      // });

      // return () => {
      //   this.socket.off('driverRideDeleted');
      //   this.socket.off('deleteConfirmRideError');
      // };
    });
  }

}


// getUpdatedDriverRideData(): Observable<any> {
  //   return new Observable<any>((observer) => {
  //     this.socket.on('updateDriverRideData', (driverridedata) => {
  //       observer.next(driverridedata);
  //     });

  //     return () => {
  //       this.socket.off('updateDriverRideData');
  //     };
  //   });
  // }

  // getTimeoutDriverRideData(): Observable<any> {
  //   return new Observable<any>((observer) => {
  //     this.socket.on('driverridetimeout', timeoutResult => {
  //       observer.next(timeoutResult);
  //     });
  //     return () => {
  //       this.socket.off('driverridetimeout');
  //     };
  //   });
  // }
  // getAssignedDriverNameUpdate() {
  //   return this.socket.fromEvent('assignedDriverNameUpdate');
  // }

  // updateAssignedDriverName(rideId: string, driverName: string) {
  //   this.socket.emit('updateAssignedDriverName', { rideId, driverName });
  // }

// updateDriverType(data: any): Observable<any> {
//   return new Observable<any>(observer => {
//     this.socket.emit('updateDriverType', data);

//     this.socket.on('driverTypeUpdated', result => {
//       observer.next(result);
//     });

//     this.socket.on('updateDriverTypeError', error => {
//       observer.error(error);
//     });

//     return () => {
//       this.socket.off('driverTypeUpdated');
//       this.socket.off('updateDriverTypeError');
//     };
//   });
// }


// updateType(driverId: string, driverType: string): void {
//   this.socket.emit('updateDriverType', { driverId, driverType });
// }

// subscribeToListenDriverTypeUpdate(): Observable<any> {
//   return new Observable<any>(observer => {
//     this.socket.on('driverTypeUpdated', updatedDriverType => {
//       observer.next(updatedDriverType);
//     });

//     return () => {
//       this.socket.off('driverTypeUpdated');
//     };
//   });
// }

  // getDriverwithoutpage(): Observable<any> {
  //   return new Observable<any>(observer => {
  //     this.socket.on('getDriversWithoutPage', updatedAllDriver => {
  //       observer.next(updatedAllDriver);
  //     });

  //     return () => {
  //       this.socket.off('driverAllUpdate');
  //     };
  //   });
  // }

  // getDriversWithoutPage(): Observable<any> {
  //   return new Observable<any>(observer => {
  //     this.socket.emit('getDriversWithoutPage', {}, (response) => {
  //       observer.next(response.driverlistalldata);
  //     });

  //     return () => {
  //       // No need to handle anything on unsubscription for this particular event
  //     };
  //   });
  // }

  //  updateStatus(driverId: string, driverStatus: string): Observable<any> {
  //   return new Observable<any>((observer) => {
  //     this.socket.emit('driverStatusUpdate', { driverId, driverStatus });

  //     this.socket.on('driverUpdate', (updatedDriver) => {
  //       observer.next(updatedDriver);
  //     });

  //     return () => {
  //       // Clean up code when the observer is unsubscribed
  //       this.socket.off('driverUpdate');
  //     };
  //   });
  // }