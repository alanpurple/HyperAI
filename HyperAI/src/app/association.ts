import { Component, OnInit } from '@angular/core';

import { DataService } from './data.service';

@Component({
  templateUrl: './association.html'
})
export class Association implements OnInit {
  constructor(
    private dataService: DataService
  ) {

  }

  tableNames: string[] = [];

  ngOnInit() {
    this.dataService.getDataMy().subscribe(datalist => {
      this.tableNames = datalist.filter(data => data.type == 'structural').map(data => data.name);
    })
  }
}
