import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from './user.service';
import { EdaService } from './eda.service';
import { AllData, DataBasic, EdaData } from './data.info';
import { UserData } from './user.data';
import { ErrorAlert } from './shared/error.alert';
import { ConfirmDialog } from './shared/confirm.dialog';
import { MatTable, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

interface DirtyData {
  name: string;
  numRows: number;
  parentId: number;
}

@Component({
    selector: 'app-eda',
    templateUrl: './eda.component.html',
    styleUrls: ['./eda.component.sass'],
    standalone: true,
    imports: [NgIf, MatProgressSpinnerModule, MatTabsModule, MatTableModule, MatSortModule, MatButtonModule, RouterLink]
})
export class EdaComponent implements OnInit {

  constructor(
    private userService: UserService,
    private errorAlert: ErrorAlert,
    private edaService: EdaService,
    private confirmDialog: ConfirmDialog
  ) { }

  @ViewChild('all') allTable: MatTable<AllData> | null = null;
  @ViewChild('dirty') dirtyTable: MatTable<DataBasic> | null = null;
  @ViewChild('cleansed') cleansedTable: MatTable<EdaData> | null = null;
  @ViewChild('preprocessed') preprocessedTable: MatTable<EdaData> | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: user => {
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
            this.dirtyData.push({ name: elem.name, numRows: elem.numRows, parentId: index });
          if (elem.preprocessed) {
            this.allData.push({ name: elem.preprocessed.name, numRows: elem.preprocessed.numRows, type: elem.type, status: 'preprocessed' });
            this.preprocessedData.push({ name: elem.preprocessed.name, numRows: elem.preprocessed.numRows, parentId: index });
          }
        });
        this.isLoading = false;
        this.allTable?.renderRows();
        this.dirtyTable?.renderRows();
        this.cleansedTable?.renderRows();
        this.preprocessedTable?.renderRows();
      },
      error: err => this.errorAlert.open(err.error)
    });
  }

  user: UserData = new UserData();
  allData: AllData[] = [];
  dirtyData: DirtyData[] = [];
  cleansedData: EdaData[] = [];
  preprocessedData: EdaData[] = [];

  displayedColumnsAll: string[] = ['name', 'type', 'numRows', 'status'];
  displayedColumns: string[] = ['name', 'numRows'];
  displayedColumns1: string[] = ['name', 'type', 'numRows', 'cleanse'];
  displayedColumns2: string[] = ['name', 'numRows', 'preprocess'];

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
          this.allTable?.renderRows();
          this.preprocessedTable?.renderRows();
          this.confirmDialog.open('successfully preprocessed');
        }
        else
          this.confirmDialog.open('not processed');
      }
    )
  }

  cleanse(id:number,name: string) {
    this.edaService.cleanse(name).subscribe({
      next: res => {
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
          this.allTable?.renderRows();
          this.dirtyTable?.renderRows();
          this.confirmDialog.open('this table is clean, nothing to cleanse');
        }
        else if (res.msg.includes('cleansed')) {
          this.user.data[id].cleansed = { name: res.table, numRows: res.numRows };
          this.allData.push({ name: res.table, numRows: res.numRows, status: 'cleansed', type: 'structural' });
          this.cleansedData.push({ name: res.table, numRows: res.numRows, parentId: id });
          this.allTable?.renderRows();
          this.cleansedTable?.renderRows();
          this.confirmDialog.open('cleansing complete');
        }
        else
          throw new Error('unreachable points');
      },
      error: err => this.errorAlert.open(err.error)
    })
  }

}
