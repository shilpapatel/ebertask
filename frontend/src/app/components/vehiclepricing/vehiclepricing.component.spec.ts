import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclepricingComponent } from './vehiclepricing.component';

describe('VehiclepricingComponent', () => {
  let component: VehiclepricingComponent;
  let fixture: ComponentFixture<VehiclepricingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehiclepricingComponent]
    });
    fixture = TestBed.createComponent(VehiclepricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
