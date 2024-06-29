import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMesDelCamioneroComponent } from './page-mes-del-camionero.component';

describe('PageMesDelCamioneroComponent', () => {
  let component: PageMesDelCamioneroComponent;
  let fixture: ComponentFixture<PageMesDelCamioneroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageMesDelCamioneroComponent]
    });
    fixture = TestBed.createComponent(PageMesDelCamioneroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
