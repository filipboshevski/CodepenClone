import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-source-code-prompt-modal',
  templateUrl: './source-code-prompt-modal.component.html',
  styleUrls: ['./source-code-prompt-modal.component.css']
})
export class SourceCodePromptModalComponent implements OnInit {

  @Output() sourceCodeOption: EventEmitter<number>;

  constructor() {
    this.sourceCodeOption = new EventEmitter<number>();
  }

  ngOnInit(): void {
  }

  onClick($event: any) {
    if ($event.target.id === '1') {
      this.sourceCodeOption.emit(1);
    } else {
      this.sourceCodeOption.emit(2);
    }
  }

}
