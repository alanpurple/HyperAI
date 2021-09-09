import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { UserService } from './user.service';
import { EdaService } from './eda.service';
import { AllData, DataBasic, EdaData } from './data.info';
import { UserData } from './user.data';
import { ErrorAlert } from './error.alert';
import { ConfirmDialog } from './confirm.dialog';

@Component({
  selector: 'app-eda',
  templateUrl: './eda.component.html',
  styleUrls: ['./eda.component.sass']
})
export class EdaComponent implements OnInit {

  constructor(
    private userService: UserService,
    private errorAlert: ErrorAlert,
    private edaService: EdaService,
    private confirmDialog: ConfirmDialog
  ) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      if (user.accountType == 'admin') {
        this.errorAlert.open('this component is available for non-admin only(maybe for now)');
        return;
      }
      this.user = user;
      this.user.data.forEach((elem, index) => {
        this.allData.push({ name: elem.name, numRows: elem.numRows, type: elem.type, status: elem.isClean ? 'clean' : 'dirty' });
        if (elem.isClean && elem.cleansed)
          throw new Error('marked clean and cleansed? error');
        if (elem.isClean)
          this.cleansedData.push({ name: elem.name, numRows: elem.numRows, parentId: index });
        else if (elem.cleansed) {
          this.allData.push({
            name: elem.cleansed.name, numRows: elem.cleansed.numRows, type: elem.type,
            status: 'cleansed'
          });
          this.cleansedData.push({ name: elem.cleansed.name, numRows: elem.cleansed.numRows, parentId: index });
        }
        else
          this.dirtyData.push({ name: elem.name, numRows: elem.numRows });
        if (elem.preprocessed) {
          this.allData.push({ name: elem.preprocessed.name, numRows: elem.preprocessed.numRows, type: elem.type, status: 'preprocessed' });
          this.preprocessedData.push({ name: elem.preprocessed.name, numRows: elem.preprocessed.numRows, parentId: index });
        }
      });
    },
      err => this.errorAlert.open(err));
  }

  user: UserData = new UserData();
  allData: AllData[] = [];
  dirtyData: DataBasic[] = [];
  cleansedData: EdaData[] = [];
  preprocessedData: EdaData[] = [];

  displayedColumnsAll: string[] = ['name', 'type', 'numRows', 'status'];
  displayedColumns: string[] = ['name', 'type', 'numRows'];
  displayedColumns1: string[] = ['name', 'type', 'numRows', 'cleanse'];
  displayedColumns2: string[] = ['name', 'type', 'numRows', 'preprocess'];

  isLoading: boolean = false;

  normlog(id:number,name: string) {
    this.edaService.normLog(name).subscribe(
      res => {
        if (res.msg.includes('normalized')) {
          this.user.data[id].preprocessed = {
            name: res.table,
            numRows: res.numRows
          };
          this.allData.push({
            name: res.table,
            numRows: res.numRows,
            status: 'preprocessed',
            type: 'structural'
          });
          this.preprocessedData.push({
            name: res.table,
            numRows: res.numRows,
            parentId: id
          });
        }
        else
          this.confirmDialog.open('not processed');
      }
    )
  }

  cleanse(id:number,name: string) {
    this.edaService.cleanse(name).subscribe(
      res => {
        if (res.msg.includes('clean')) {
          this.user.data[id].isClean = true;
          const allId = this.allData.findIndex(elem => elem.name == name);
          if (allId < 0)
            throw new Error('integration failed');
          this.allData[allId].status = 'clean';
          const dataId = this.dirtyData.findIndex(elem => elem.name == name);
          if (dataId < 0)
            throw new Error('integration failed');
          this.dirtyData.splice(dataId, 1);
        }
        else if (res.msg.includes('cleansed')) {
          this.user.data[id].cleansed = { name: res.table, numRows: res.numRows };
          this.allData.push({ name: res.table, numRows: res.numRows, status: 'cleansed', type: 'structural' });
          this.cleansedData.push({ name: res.table, numRows: res.numRows, parentId: id });
        }
        else
          throw new Error('unreachable points');
      },
      err => this.errorAlert.open(err)
    )
  }

}
