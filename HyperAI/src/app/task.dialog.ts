import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { StructuralTask, TextTask, VisionTask } from './project.data'

@Component({
  selector: 'vision-task-dialog',
  templateUrl: './task-dialog.vision.html'
})
export class VisionTaskDialog {
  constructor(
    public dialogRef: MatDialogRef<VisionTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public task: VisionTask,
    @Inject(MAT_DIALOG_DATA) public isNew: boolean
  ) { }
}

@Component({
  selector: 'structural-task-dialog',
  templateUrl: './task-dialog.structural.html'
})
export class StructuralTaskDialog {
  constructor(
    public dialogRef: MatDialogRef<VisionTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public task: StructuralTask,
    @Inject(MAT_DIALOG_DATA) public isNew: boolean
  ) { }
}

@Component({
  selector: 'text-task-dialog',
  templateUrl: './task-dialog.text.html'
})
export class TextTaskDialog {
  constructor(
    public dialogRef: MatDialogRef<TextTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public task: TextTask,
    @Inject(MAT_DIALOG_DATA) public isNew: boolean
  ) { }
}
