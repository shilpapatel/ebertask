import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmridesComponent } from './confirmrides.component';

describe('ConfirmridesComponent', () => {
  let component: ConfirmridesComponent;
  let fixture: ComponentFixture<ConfirmridesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmridesComponent]
    });
    fixture = TestBed.createComponent(ConfirmridesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
