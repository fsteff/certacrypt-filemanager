import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendStateComponent } from './friend-state.component';

describe('FriendStateComponent', () => {
  let component: FriendStateComponent;
  let fixture: ComponentFixture<FriendStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FriendStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
