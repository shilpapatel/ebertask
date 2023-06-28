import { TestBed } from '@angular/core/testing';

import { VehiclepricingService } from './vehiclepricing.service';

describe('VehiclepricingService', () => {
  let service: VehiclepricingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiclepricingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
