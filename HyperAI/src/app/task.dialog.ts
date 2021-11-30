import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

import { StructuralTask, TextTask, VisionTask } from './project.data';

import { NameRe } from './shared/validataions';

@Component({
  selector: 'vision-task-dialog',
  templateUrl: './task.dialog.vision.html'
})
export class VisionTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: VisionTask, isNew: boolean }
  ) { }

  taskTypes = ['preprocess', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {

  }
}

@Component({
  selector: 'structural-task-dialog',
  templateUrl: './task.dialog.structural.html'
})
export class StructuralTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: StructuralTask, isNew: boolean }
  ) { }

  taskTypes = ['preprocess', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {

  }
}

@Component({
  selector: 'text-task-dialog',
  templateUrl: './task.dialog.text.html'
})
export class TextTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: TextTask, isNew: boolean }
  ) { }

  taskTypes = ['tokenization', 'vectorization', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {

  }
}
