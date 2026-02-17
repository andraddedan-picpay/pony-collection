import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PonyButtonComponent } from './pony-button.component';

describe('PonyButtonComponent', () => {
  let component: PonyButtonComponent;
  let fixture: ComponentFixture<PonyButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PonyButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PonyButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant as primary', () => {
    expect(component.variant()).toBe('primary');
  });

  it('should have default type as button', () => {
    expect(component.type()).toBe('button');
  });

  it('should emit click event when clicked and not disabled', () => {
    let clickEmitted = false;
    component.click.subscribe(() => {
      clickEmitted = true;
    });

    const mockEvent = new MouseEvent('click');
    component.handleClick(mockEvent);

    expect(clickEmitted).toBe(true);
  });

  it('should not emit click event when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clickEmitted = false;
    component.click.subscribe(() => {
      clickEmitted = true;
    });

    const mockEvent = new MouseEvent('click');
    component.handleClick(mockEvent);

    expect(clickEmitted).toBe(false);
  });

  it('should not emit click event when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    let clickEmitted = false;
    component.click.subscribe(() => {
      clickEmitted = true;
    });

    const mockEvent = new MouseEvent('click');
    component.handleClick(mockEvent);

    expect(clickEmitted).toBe(false);
  });
});
