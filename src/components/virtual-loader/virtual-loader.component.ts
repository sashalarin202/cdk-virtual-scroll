import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { filter, map, pairwise, throttleTime, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

interface Character{
  name: string;
  image: string;
  gender: string;
  species: string;
}

interface Characters {
  results: Character[];
}

@Component({
  selector: 'app-virtual-loader',
  templateUrl: './virtual-loader.component.html',
  styleUrls: ['./virtual-loader.component.scss']
})

export class VirtualLoaderComponent implements OnInit {

  pageNumber: number = 0;
  characters: Characters = {results: []};

  isLoading = false;

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
  ) {}

@ViewChild('scroller') scroller: CdkVirtualScrollViewport;


  ngOnInit(): void {
    this.fetchItem();
  }

  ngAfterViewInit(): void {

    this.scroller.elementScrolled().pipe(
      map(() => this.scroller.measureScrollOffset('bottom')),//set Scroll on bottom
      pairwise(),                                            //add Scroll for top and bottom
      filter(([y1, y2]) => (y2 < y1 && y2 < 140)),          //first scroll check
      throttleTime(200)
    ).subscribe(() => {
        this.ngZone.run(() => {
        this.fetchItem();
        });
      }
    );
  }

  fetchItem(): void {
    this.pageNumber += 1

    this.http.get<Characters>(`${environment.apiURL}`+this.pageNumber)
      .subscribe(characters => {
        this.isLoading = true;
        timer(1000).subscribe(() => {
          this.isLoading = false;
          this.characters.results = [...this.characters.results,...characters.results];
      })
    });
  }
}
