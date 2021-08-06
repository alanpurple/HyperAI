import { Component, OnInit } from '@angular/core';
import { PieData, BoxPlotData, ScatterData, PlotData } from 'plotly.js';

import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';

@Component({
  templateUrl: './association.html'
})
export class Association implements OnInit {
  constructor(
    private dataService: DataService,
    private errorAlert: ErrorAlert
  ) {

  }

  tableNames: string[] = [];

  associationData1: PlotData[] = [];
  associationData2: PieData[] = [];
  boxPlotData: BoxPlotData[] = [];
  lrData = [];


  ngOnInit() {
    this.dataService.getDataMy().subscribe(datalist => {
      this.tableNames = datalist.filter(data => data.type == 'structural').map(data => data.name);
    })
  }
}
