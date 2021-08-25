import { Component, OnInit } from '@angular/core';

import { SummaryData } from './summary.data';
import { EdaService, SummaryDataSource } from './eda.service';
import { DataService } from './data.service';
import { ErrorAlert } from './error.alert';

@Component({
  selector: 'app-desc',
  templateUrl: './desc.component.html',
  styleUrls: ['./desc.component.sass']
})
export class DescComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private edaService: EdaService,
    private errorAlert: ErrorAlert
  ) { }

  tables: string[] = [];
  isOpen: boolean = false;
  summaries: SummaryData[] = [];
  selectedTable: string | null = null;
  ngOnInit(): void {
    this.dataService.getDataMy().subscribe(
      data => this.tables = data.filter(elem => elem.type == 'structural').map(elem => elem.name),
      err => this.errorAlert.open(err)
    );
    this.summaryDataSource = new SummaryDataSource(this.edaService);
  }

  summaryDataSource: SummaryDataSource | null = null;

  props = ['name', 'count', 'type', 'unique', 'freq', 'top',
    'mean', 'std', 'min', 'q1', 'q2', 'q3', 'max'];

  resetInspection() {
    this.summaries = [];
  }

  public processing: boolean = false;

  getSummary() {
    if (!this.summaryDataSource)
      return;
    if (!this.selectedTable) {
      this.errorAlert.open('table is null, error');
      return;
    }
    this.processing = true;
    this.summaryDataSource.getSummary(this.isOpen,this.selectedTable)
      .subscribe(data => {
        this.summaries = data;
        this.processing = false;
      }, err => this.errorAlert.open(err));
  }

}
