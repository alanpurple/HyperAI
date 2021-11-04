import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConsole } from './admin.console';

describe('AdminConsole', () => {
  let component: AdminConsole;
  let fixture: ComponentFixture<AdminConsole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminConsole ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConsole);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
