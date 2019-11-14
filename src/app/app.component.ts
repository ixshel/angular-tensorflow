import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconRegistry } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'predictive-app';

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

  reason: string = '';
  constructor(private matIconRegistry: MatIconRegistry) { 
    // this.matIconRegistry.addSvgIcon('menu');
  }

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }
}
