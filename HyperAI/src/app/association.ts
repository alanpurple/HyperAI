import { Component, OnInit } from '@angular/core';
import { PieData, BoxPlotData, ScatterData, PlotData, Layout } from 'plotly.js';

import { LrService } from './lr.service';

import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';
import { EdaService } from './eda.service';

import { SummaryData } from './summary.data';

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

  openTables: string[] = [];
  myTables: string[] = [];

  isOpen: boolean = false;
  gettingData: boolean = false;
  isLoading: boolean = false;
  selectedTable: string = '';

  summary: SummaryData[] = [];
  source: SummaryData | {} = {};
  target: SummaryData | {} = {};

  barLayout: Layout | {} = {};
  pieLayout: Layout | {} = {};
  boxPlotLayout: Layout | {} = {};
  lrLayout: Layout | {} = {};


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
      this.tableNames = this.myTables = datalist.filter(data => data.type == 'structural').map(data => data.name);
    });
    this.dataService.getDataPublic().subscribe(datalist => {
      this.openTables = datalist.filter(data => data.type == 'structural').map(data => data.name);
    });
  }

  getSummary() {
    this.summary = [];
    this.gettingData = true;
    this.edaService.describe(this.selectedTable)
      .subscribe(data => {
        this.gettingData = false;
        this.summary = data;
      }, err => this.errorAlert.open(err));
    this.source = {};
    this.target = {};
    this.resetAssociation();
  }

  swapTables() {
    if (this.isOpen)
      this.tableNames = this.openTables;
    else
      this.tableNames = this.myTables;
  }

  resetAssociation() {
    this.associationData1 = [];
    this.associationData2 = [];
    this.boxPlotData = [];
    this.lrData = [];
  }

  graphType: boolean = false;
  type: number|null = null;

  // only category to category case is implemented currently
  isValid(target: SummaryData): boolean {
    // check if this.source is empty
    if (!('type' in this.source))
      return false;
    if (this.source == target)
      return false;
    if (this.source.type == 'categorical') {
      if (target.type == 'numeric')
        return false;
    }
    if (target.type == 'categorical')
      if (target.unique > 20)
        return false;
    return true;
  }

  analyzeAssociation() {
    if (!('type' in this.source) || !('type' in this.target))
      return;
    let type = 2;
    if (this.source.type == 'numeric') {
      if (this.target.type == 'categorical')
        type = 1;
    }
    else if (this.target.type == 'numeric') {
      console.error('this should not exist');
      return;
    }
    else
      type = 0;
    switch (type) {
      case 0: case 1:
        this.edaService.getAssociation(this.isOpen, this.selectedTable, this.source.name, this.target.name, type);
    }
  }
}
