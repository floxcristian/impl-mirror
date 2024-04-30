import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFlotaComponent } from './page-flota.component';

describe('PageFlotaComponent', () => {
  let component: PageFlotaComponent;
  let fixture: ComponentFixture<PageFlotaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageFlotaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFlotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
