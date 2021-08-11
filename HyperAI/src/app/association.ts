import { Component, OnInit } from '@angular/core';
import { PieData, BoxPlotData, ScatterData, PlotData, Layout } from 'plotly.js';

import { LrService } from './lr.service';

import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';
import { EdaService } from './eda.service';

@Component({
  templateUrl: './association.html'
})
export class Association implements OnInit {
  constructor(
    private lrService: LrService,
    private dataService: DataService,
    private edaService: EdaService,
    private errorAlert: ErrorAlert
  ) { }

  tableNames: string[] = [];

  selectedTable: string = '';
  barLayout: Layout | {} = {};
  pieLayout: Layout | {} = {};
  boxPlotLayout: Layout | {} = {};


  associationData1: PlotData[] = [];
  associationData2: PieData[] = [];
  boxPlotData: BoxPlotData[] = [];
  lrData = [];

  private readonly colors: string[] = ['rgba(93, 164, 214, 0.5)', 'rgba(255, 144, 14, 0.5)',
    'rgba(44, 160, 101, 0.5)', 'rgba(255, 65, 54, 0.5)', 'rgba(207, 114, 255, 0.5)',
    'rgba(127, 96, 0, 0.5)', 'rgba(255, 140, 184, 0.5)', 'rgba(79, 90, 117, 0.5)',
    'rgba(222, 223, 0, 0.5)'];

  ngOnInit() {
    this.dataService.getDataMy().subscribe(datalist => {
      this.tableNames = datalist.filter(data => data.type == 'structural').map(data => data.name);
    })
  }

  resetAssociation() {
    this.associationData1 = [];
    this.associationData2 = [];
    this.boxPlotData = [];
    this.lrData = [];
  }
}
