import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface DialogData {
  title?: string;
  prompt?: string;
  no?: string;
  ok?: string;
}

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss'],
})
export class PromptDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public ngOnInit() {}

  public close(confirm: boolean): void {
    this.dialogRef.close({
      confirm,
      prompt: this.data.prompt,
    });
  }
}
