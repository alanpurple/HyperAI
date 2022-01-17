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
    @Inject(MAT_DIALOG_DATA) public data: { task: VisionTask | undefined, isNew: boolean }
  ) {
    if (!data.isNew) {
      if (data.task)
        this.originalTask = JSON.parse(JSON.stringify(data.task));
    }
    else
      data.task = {
        name: '',
        taskType: 'preprocess',
        completed: false,
        description: "",
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

  }

  originalTask: VisionTask = {
    name: '',
    taskType: 'preprocess',
    completed: false,
    description: "",
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
