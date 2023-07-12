import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationCount = 0;
  private notificationCountSubject = new Subject<number>();
  constructor() { }
  getNotificationCount() {
    return this.notificationCount;
  }

  getNotificationCountSubject() {
    return this.notificationCountSubject.asObservable();
  }

  incrementNotificationCount() {
    this.notificationCount++;
    this.notificationCountSubject.next(this.notificationCount);
  }

  decrementNotificationCount() {
    if (this.notificationCount > 0) {
      this.notificationCount--;
      this.notificationCountSubject.next(this.notificationCount);
    }
  }
}
