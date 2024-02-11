import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceCodePromptModalComponent } from './source-code-prompt-modal.component';

describe('SourceCodePromptModalComponent', () => {
  let component: SourceCodePromptModalComponent;
  let fixture: ComponentFixture<SourceCodePromptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceCodePromptModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceCodePromptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
