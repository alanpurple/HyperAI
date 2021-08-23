import { Component, OnInit } from '@angular/core';
import { DataDatabase, DataService } from './data.service';
import { AllData, DataInfo } from './data.info';

@Component({
  selector: 'app-eda',
  templateUrl: './eda.component.html',
  styleUrls: ['./eda.component.sass']
})
export class EdaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  allData: AllData[] = [];
  dirtyData: DataInfo[] = [];
  cleansedData: DataInfo[] = [];
  preprocessedData: DataInfo[] = [];

  displayedColumnsAll: string[] = ['name', 'type', 'numRows', 'isClean'];
  displayedColumns: string[] = ['name', 'type', 'numRows'];
  displayedColumns1: string[] = ['name', 'type', 'numRows', 'cleanse'];
  displayedColumns2: string[] = ['name', 'type', 'numRows', 'preprocess'];

  isLoading: boolean = false;

  preprocess(name: string) {

  }

  cleanse(name: string) {

  }

}
