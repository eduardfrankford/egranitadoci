import { TestBed } from '@angular/core/testing';
import { ContactForm } from './contact-form';

describe('ContactForm (Spam-Schutz)', () => {
  const fill = (form: ContactForm) =>
    form.form.setValue({
      name: 'Anna',
      email: 'anna@example.com',
      phone: '',
      message: 'Hallo',
      source: '',
      consent: true,
      _gotcha: '',
    });

  it('sendet ein unvollständiges Formular nicht ab', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const fixture = TestBed.createComponent(ContactForm);
    await fixture.whenStable();
    await fixture.componentInstance.submit();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.state()).toBe('idle');
    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
    fetchSpy.mockRestore();
  });

  it('verwirft Bot-Eingaben mit ausgefülltem Honeypot still', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const fixture = TestBed.createComponent(ContactForm);
    await fixture.whenStable();
    fill(fixture.componentInstance);
    fixture.componentInstance.form.controls._gotcha.setValue('http://spam.example');
    await fixture.componentInstance.submit();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.state()).toBe('sent');
    fetchSpy.mockRestore();
  });

  it('verwirft Eingaben, die unrealistisch schnell abgeschickt werden', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const fixture = TestBed.createComponent(ContactForm);
    await fixture.whenStable();
    fill(fixture.componentInstance);
    await fixture.componentInstance.submit(); // direkt nach dem Öffnen → unter der Mindestzeit
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.state()).toBe('sent');
    fetchSpy.mockRestore();
  });
});
