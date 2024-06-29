import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Camionero24OkModalComponent } from './camionero24-ok-modal.component';

describe('Camionero24OkModalComponent', () => {
  let component: Camionero24OkModalComponent;
  let fixture: ComponentFixture<Camionero24OkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Camionero24OkModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Camionero24OkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
