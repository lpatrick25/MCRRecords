import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentFormPage } from './document-form.page';

describe('DocumentFormPage', () => {
  let component: DocumentFormPage;
  let fixture: ComponentFixture<DocumentFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DocumentFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
