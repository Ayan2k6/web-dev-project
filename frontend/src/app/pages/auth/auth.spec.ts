import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from './auth';
import { AuthService } from '../../services/auth.service';

const mockAuthService = {
  login: jasmine.createSpy('login').and.returnValue(of({})),
  register: jasmine.createSpy('register').and.returnValue(of({})),
};

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in login mode', () => {
    expect(component.mode).toBe('login');
  });

  it('should switch to register mode', () => {
    component.switchMode('register');
    expect(component.mode).toBe('register');
    expect(component.error).toBe('');
    expect(component.status).toBe('');
  });

  it('should not submit login if fields are empty', () => {
    component.loginForm = { username: '', password: '' };
    component.submitLogin();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should not submit register if password is too short', () => {
    component.registerForm.username = 'testuser';
    component.registerForm.password = '123';
    component.submitRegister();
    expect(component.error).toContain('8 символов');
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should reset error and status on mode switch', () => {
    component.error = 'Some error';
    component.status = 'Some status';
    component.switchMode('register');
    expect(component.error).toBe('');
    expect(component.status).toBe('');
  });
});
