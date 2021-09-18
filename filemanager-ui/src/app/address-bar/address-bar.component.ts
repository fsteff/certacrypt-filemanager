import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-address-bar',
  templateUrl: './address-bar.component.html',
  styleUrls: ['./address-bar.component.css']
})
export class AddressBarComponent implements OnInit {
  path: {name: string, link: string}[]
  
  constructor(private route: ActivatedRoute) { this.path = []}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const route = window.decodeURIComponent(params.get('path'))
      const parts = route.split('/').filter(p => p.length > 0)
      let path = ''
      this.path = []
      for (const part of parts) {
        path += '/' + part
        const link = '/explorer/' + window.encodeURIComponent(path)
        this.path.push({name: part, link})
      }
    })
  }

}
