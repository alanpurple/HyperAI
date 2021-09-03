import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { UserService } from './user.service';
import { AllData, DataInfo } from './data.info';
import { UserData } from './user.data';
import { ErrorAlert } from './error.alert';

@Component({
  selector: 'app-eda',
  templateUrl: './eda.component.html',
  styleUrls: ['./eda.component.sass']
})
export class EdaComponent implements OnInit {

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private errorAlert: ErrorAlert
  ) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      if (user.accountType == 'admin') {
        this.errorAlert.open('this component is available for non-admin only(maybe for now)');
        return;
      }
      this.user = user;
      this.dataService.getDataMy().subscribe(
        data => {
          this.allData = user.data.map(elem => {
            let elemData = data.find(elem2 => elem2.name == elem);
            if (!elemData) {
              this.errorAlert.open('something\'s wrong, data corrupted, integration failed');
              // this line is just a dummy line(for typescript) since erroralert cause not to reach there
              throw Error('errror');
            }
            return {
              name: elemData.name,
              type: elemData.type,
              numRows: elemData.numRows,
              isClean: user.cleanData.includes(elem)
            }
          });
          this.dirtyData = data.filter(elem =>
            !user.cleanData.includes(elem.name) && !user.cleansedData.includes(elem.name)
            && !user.preprocessedData.includes(elem.name));
          this.cleansedData = data.filter(elem => user.cleansedData.includes(elem.name));
          this.preprocessedData = data.filter(elem => user.preprocessedData.includes(elem.name));
        }
      )
    },
      err => this.errorAlert.open(err));
  }

  user: UserData = new UserData();
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
