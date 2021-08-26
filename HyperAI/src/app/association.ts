import { Component, OnInit } from '@angular/core';
import { PieData, BoxPlotData, ScatterData, PlotData, Layout } from 'plotly.js';

import { LrService } from './lr.service';

import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';
import { EdaService } from './eda.service';

import { SummaryData } from './summary.data';

@Component({
  templateUrl: './association.html',
  styleUrls: ['./association.sass']
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
  source: SummaryData | null = null;
  target: SummaryData | null = null;

  barLayout: Layout | {} = {};
  pieLayout: Layout | {} = {};
  //boxPlotLayout: Layout | {} = {};
  lrLayout: Layout = {} as Layout;


  associationData1: any[] = [];
  associationData2: PieData[] = [];
  boxPlotData: BoxPlotData[] = [];
  lrData: PlotData[] = [];

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
    this.type = null;
    this.summary = [];
    this.gettingData = true;
    this.edaService.describe(this.isOpen,this.selectedTable)
      .subscribe(data => {
        this.gettingData = false;
        this.summary = data;
      }, err => this.errorAlert.open(err));
    this.source = null;
    this.target = null;
    this.resetAssociation();
  }

  swapTables() {
    if (this.isOpen)
      this.tableNames = this.openTables;
    else
      this.tableNames = this.myTables;
    this.resetAssociation();
    this.selectedTable = '';
    this.summary = [];
    this.source = this.target = null;
  }

  resetAssociation() {
    this.associationData1 = [];
    this.associationData2 = [];
    this.boxPlotData = [];
    this.lrData = [];
    this.type = null;
  }

  graphType: boolean = false;
  type: number|null = null;

  // only category to category case is implemented currently
  isValid(target: SummaryData): boolean {
    // check if this.source is empty
    if (!this.source)
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
    if (!this.source || !this.target)
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
        this.edaService.getAssociation(this.isOpen, this.selectedTable, this.source.name, this.target.name, type)
          .subscribe(data => {
            if (type == 0) {
              this.associationData1 = [];
              for (let prop in data) {
                let keys = Object.keys(data[prop]);
                let tempData = { name: prop, x: keys, y: [] as any, type: 'bar' };
                for (let prop2 in keys)
                  tempData.y.push(data[prop][prop2]);
                this.associationData1.push(tempData);
              }
              
              this.barLayout = { barmode: 'group' };
              this.type = type;
            }
            else if (type == 1) {
              let i = 0;
              this.associationData2 = [];
              let masterKeys =Object.keys(data);
              for (let i = 0; i < masterKeys.length; i++) {
                let item = data[masterKeys[i]];
                let keys = Object.keys(item);
                let values = [];
                for (let key in keys)
                  values.push(item[key]);
                this.associationData2.push({
                  labels: keys,
                  values: values,
                  type: 'pie',
                  name: masterKeys[i],
                  marker: {
                    colors: this.colors
                  },
                  domain: {
                    row: i / 4,
                    column: i % 4
                  },
                  hoverinfo: 'label+percent+name',
                  textinfo: 'none'
                } as PieData);
              }
              this.pieLayout = { height: 500, width: 600, grid: { rows: masterKeys.length / 4, columns: 4 } };
              this.type = type;
            }
            else
              console.error('something is going totally mass');
          });
        break;
      case 2:
        this.lrService.elasticnetcv({
          tableName: this.selectedTable,
          sourceColumn: this.source.name,
          targetColumn: this.target.name,
          isOpen: this.isOpen
        }).subscribe(data => {
          if (!this.source || !this.target) {
            this.errorAlert.open('something\'s wrong, source or target is null');
            return;
          }
          let lineTrace: ScatterData = {} as ScatterData;
          lineTrace.x = [this.source.min - 1, this.source.max + 1];
          lineTrace.y = [(this.source.min - 1) * data.slope + data.intercept,
            (this.source.max + 1) * data.slope + data.intercept];
          lineTrace.name = 'Fitted linear regression';
          lineTrace.mode = 'lines';
          let scatterTrace: ScatterData = {} as ScatterData;
          scatterTrace.type = 'scatter';
          scatterTrace.name = 'Original Data';
          scatterTrace.mode = 'markers';
          return this.dataService.getDataCompact(
            this.isOpen, this.selectedTable, [this.source.name, this.target.name])
            .subscribe(original => {
              if (!this.source || !this.target) {
                this.errorAlert.open('something\'s wrong, source or target is null');
                return;
              }
              scatterTrace.x = original.data.map(elem => {
                if (!this.source) {
                  this.errorAlert.open('something\'s wrong, source or target is null');
                  return;
                }
                return elem[this.source.name]
              });
              scatterTrace.y = original.data.map(elem => {
                if (!this.target) {
                  this.errorAlert.open('something\'s wrong, source or target is null');
                  return;
                }
                return elem[this.target.name]
              });
              /* newPlot(this.plot.nativeElement, [lineTrace, scatterTrace],
                  {
                      title: 'linear regression between '
                      + this.source.name + ' and ' + this.target.name
                  }); */
              this.lrData = [lineTrace, scatterTrace];
              this.lrLayout.title = 'linear regression between '
                + this.source.name + ' and ' + this.target.name;
              this.type = type;
            });
        }, err => this.errorAlert.open(err))

    }
  }
}
