import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareOverviewComponent } from './share-overview.component';

describe('ShareOverviewComponent', () => {
  let component: ShareOverviewComponent;
  let fixture: ComponentFixture<ShareOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
