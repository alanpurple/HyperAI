import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfo } from './user.info';

describe('UserInfo', () => {
  let component: UserInfo;
  let fixture: ComponentFixture<UserInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserInfo ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
