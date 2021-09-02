import { Component, OnInit } from '@angular/core';
import { /*PieData,*/ BoxPlotData, ScatterData, PlotData, Layout } from 'plotly.js';
import { Color } from '@swimlane/ngx-charts';

import { LrService } from './lr.service';

import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';
import { EdaService } from './eda.service';
import { UserService } from './user.service';

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
    private errorAlert: ErrorAlert,
    private userService: UserService
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
  boxLayout: Layout | {} = {};
  lrLayout: Layout = {} as Layout;
  isAdmin: boolean = false;

  associationData: any[] = [];
  //associationData1: any[] = [];
  //associationData2: PieData[] = [];
  boxData: BoxPlotData[] = [];
  lrData: PlotData[] = [];

  private readonly colors: string[] = ['rgba(93, 164, 214, 0.5)', 'rgba(255, 144, 14, 0.5)',
    'rgba(44, 160, 101, 0.5)', 'rgba(255, 65, 54, 0.5)', 'rgba(207, 114, 255, 0.5)',
    'rgba(127, 96, 0, 0.5)', 'rgba(255, 140, 184, 0.5)', 'rgba(79, 90, 117, 0.5)',
    'rgba(222, 223, 0, 0.5)'];

  readonly colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  } as Color;

  ngOnInit() {
    this.dataService.getDataPublic().subscribe(datalist => {
      this.tableNames = this.openTables = datalist.filter(data => data.type == 'structural').map(data => data.name);
      this.userService.getUser().subscribe(
        user => {
          if (user.accountType == 'admin') {
            this.isOpen = true;
            this.isAdmin = true;
          }
          else
            this.dataService.getDataMy().subscribe(datalist => {
              this.tableNames = this.myTables = datalist.filter(data => data.type == 'structural').map(data => data.name);
            });
        }
        , err => this.errorAlert.open(err));
    }, err => this.errorAlert.open(err));
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
    //this.associationData1 = [];
    //this.associationData2 = [];
    this.associationData = [];
    this.boxData = [];
    this.lrData = [];
    this.type = null;
    this.graphType = false;
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
    if (type == 0 || type == 1)
      this.edaService.getAssociation(this.isOpen, this.selectedTable, this.source.name, this.target.name, type)
        .subscribe(data => {
          if (type == 0) {

            // graph using ngx-charts
            this.associationData = [];
            for (let prop in data) {
              let tempData = { name: prop, series: [] as any[] };
              for (let prop2 in data[prop])
                tempData.series.push({
                  name: prop2,
                  value: data[prop][prop2]
                });
              this.associationData.push(tempData);
            }

            //graph using plotly
            /*this.associationData1 = [];
            for (let prop in data) {
              let keys = Object.keys(data[prop]);
              let tempData = { name: prop, x: keys, y: [] as number[], type: 'bar' };
              keys.forEach(key => tempData.y.push(data[prop][key]))
              this.associationData1.push(tempData);
            }

            this.barLayout = { barmode: 'group' };

            let i = 0;
            this.associationData2 = [];
            let masterKeys = Object.keys(data);
            for (let i = 0; i < masterKeys.length; i++) {
              let item = data[masterKeys[i]];
              let keys = Object.keys(item);
              let values: number[] = [];
              keys.forEach(key => values.push(item[key]));
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
            this.pieLayout = { height: 500, width: 600, grid: { rows: masterKeys.length / 4, columns: 4 } };*/

            this.type = type;
          }
          else if (type == 1) {
            let i = 0;
            this.boxData = [];
            for (let prop in data) {
              let temp: BoxPlotData = {
                y: data[prop],
                name: prop,
                boxpoints: 'suspectedoutliers',
                marker: {
                  color: this.colors[i++ % 9],
                  outliercolor: this.colors[(i + 2) % 9],
                  line: {
                    outliercolor: this.colors[(i + 4) % 9]
                  }
                },
                type: 'box'
              } as BoxPlotData;
              this.boxData.push(temp);
            }
            this.type = type;
            /* newPlot(this.plot.nativeElement, this.associationData,
                { title: 'boxplots for each target attributes' }); */
            this.boxLayout = { title: 'boxplots for each target attributes' };
            this.type = type;
          }
          else
            this.errorAlert.open('something is going totally mass');
        }, err => this.errorAlert.open(err));
    else if (type == 2)
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
      }, err => this.errorAlert.open(err));
    else
      this.errorAlert.open('type should be among 0,1,and 2: current value is ' + type);
  }

  onSelect(event:any) {
    console.log(event);
  }
}
