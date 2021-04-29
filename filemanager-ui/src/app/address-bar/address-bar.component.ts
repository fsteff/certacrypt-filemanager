import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-address-bar',
  templateUrl: './address-bar.component.html',
  styleUrls: ['./address-bar.component.css']
})
export class AddressBarComponent implements OnInit {
  private route: ActivatedRoute

  path: string 
  constructor() { }

  ngOnInit(): void {
    this.path = window.location.pathname
  }

}
