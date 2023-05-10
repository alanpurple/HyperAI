import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";

import { StructuralTask, TextTask, VisionTask } from './project.data';

import { NameRe } from './shared/validataions';
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { ForbiddenValidatorDirective } from "./shared/forbidden-name.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FlexModule } from "@angular/flex-layout/flex";
import { FormsModule } from "@angular/forms";
import { NgIf, NgFor } from "@angular/common";

@Component({
    selector: 'vision-task-dialog',
    templateUrl: './task.dialog.vision.html',
    standalone: true,
    imports: [NgIf, MatDialogModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, ForbiddenValidatorDirective, MatSelectModule, NgFor, MatOptionModule, MatButtonModule]
})
export class VisionTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: VisionTask, isNew: boolean }
  ) {
    if (data.isNew)
      data.task = {
        name: '',
        taskType: 'preprocess',
        completed: false, description: "",
        preprocessed: undefined,
        include_mask: undefined,
        train_dir: undefined,
        val_dir: undefined,
        test_dir: undefined,
        train_anno: undefined,
        val_anno: undefined,
        batch_size: undefined,
        no_xla: undefined,
        use_amp: undefined,
        model_params: null,
        tb_port: undefined
      };
    else
      this.originalTask = JSON.parse(JSON.stringify(data.task));

  }

  originalTask!: VisionTask;
  taskTypes = ['preprocess', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {
    if (this.data.isNew)
      this.data.task = {
        name: '',
        taskType: 'preprocess',
        completed: false, description: "",
        preprocessed: undefined,
        include_mask: undefined,
        train_dir: undefined,
        val_dir: undefined,
        test_dir: undefined,
        train_anno: undefined,
        val_anno: undefined,
        batch_size: undefined,
        no_xla: undefined,
        use_amp: undefined,
        model_params: null,
        tb_port: undefined
      };
    else
      this.data.task = this.originalTask;
  }
}

@Component({
    selector: 'structural-task-dialog',
    templateUrl: './task.dialog.structural.html',
    standalone: true,
    imports: [NgIf, MatDialogModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, ForbiddenValidatorDirective, MatSelectModule, NgFor, MatOptionModule, MatButtonModule]
})
export class StructuralTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: StructuralTask, isNew: boolean }
  ) {
    if (data.isNew)
      data.task = {
        name: '',
        description: "",
        taskType: "preprocess"
      };
    else
      this.originalTask = JSON.parse(JSON.stringify(data.task));
  }

  originalTask!: StructuralTask;

  taskTypes = ['preprocess', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {
    if (this.data.isNew)
      this.data.task = {
        name: '',
        description: "",
        taskType: "preprocess"
      };
    else
      this.data.task = this.originalTask;
  }
}

@Component({
    selector: 'text-task-dialog',
    templateUrl: './task.dialog.text.html',
    standalone: true,
    imports: [NgIf, MatDialogModule, FormsModule, FlexModule, MatFormFieldModule, MatInputModule, ForbiddenValidatorDirective, MatSelectModule, NgFor, MatOptionModule, MatButtonModule]
})
export class TextTaskDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: TextTask, isNew: boolean }
  ) {
    if (data.isNew)
      data.task = { name: '', description: '', taskType: 'tokenization' };
    else
      this.originalTask = JSON.parse(JSON.stringify(data.task));
  }

  originalTask!: TextTask;

  taskTypes = ['tokenization', 'vectorization', 'train', 'test', 'deploy'];

  nameRe = NameRe;

  reset() {
    if (this.data.isNew)
      this.data.task = { name: '', description: '', taskType: 'tokenization' };
    else
      this.data.task = this.originalTask;
  }
}
