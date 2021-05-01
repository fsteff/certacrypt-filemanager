import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-address-bar',
  templateUrl: './address-bar.component.html',
  styleUrls: ['./address-bar.component.css']
})
export class AddressBarComponent implements OnInit {
  path: string 
  
  constructor(private route: ActivatedRoute) { this.path = 'loading...'}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.path = window.decodeURIComponent(params.get('path')))
  }

}
