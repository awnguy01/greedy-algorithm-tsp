import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CityNode } from 'src/app/classes/models/city-node';
import { Utils } from 'src/app/classes/utils';
import { FormBuilder, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GreedyService } from 'src/app/services/greedy.service';
import { Results } from 'src/app/classes/models/results';
import * as CanvasJS from 'src/assets/lib/canvasjs.min.js';

const CHART_OPTS = {
  animationEnabled: true,
  theme: 'dark2',
  zoomEnabled: true,
  title: {
    text: 'Project 3 Greedy TSP'
  },
  toolTip: {
    contentFormatter: e => {
      const entry = e.entries[0] || e.entries[1];
      return `${entry.dataPoint.name}: (${entry.dataPoint.x}, ${entry.dataPoint.y})`;
    }
  },
  axisX: {
    viewportMinimum: -10,
    viewportMaximum: 110
  },
  axisY: {
    viewportMinimum: -10,
    viewportMaximum: 120
  },
  data: [
    { type: 'scatter', dataPoints: [] },
    {
      type: 'line',
      markerType: 'circle',
      markerSize: 10,
      dataPoints: []
    }
  ]
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild('graphCanvas') graphCanvas: ElementRef;

  tspFileCtrl: FormControl = this.fb.control(null);
  chart: any;

  results = new BehaviorSubject<Results | undefined>(undefined);

  constructor(readonly fb: FormBuilder, readonly greedySvc: GreedyService) {}

  ngOnInit() {
    this.chart = new CanvasJS.Chart('chartContainer', CHART_OPTS);
    this.chart.render();
    this.watchResults().subscribe();
    this.tspFileCtrlChanges().subscribe();
  }

  /** watchResults
   * @desc listen for updates in the greedy algorithm results and update the chart UI
   */
  watchResults(): Observable<Results> {
    return this.greedySvc.results.pipe(
      tap((results?: Results) => {
        if (results) {
          this.results.next(results);
          this.chart.options.data[0].dataPoints = Utils.convertCitiesToDataPoints(
            results.remCities
          );
          this.chart.options.data[1].dataPoints = Utils.convertCitiesToDataPoints(
            results.currRoute
          );
          this.chart.render();
        }
      })
    );
  }

  /** tspFileCtrlChanges
   * @desc wait to read new file inputs and begin finding the Hamiltonian path
   */
  tspFileCtrlChanges(): Observable<any> {
    return this.tspFileCtrl.valueChanges.pipe(
      tap((file: File) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const allCities = this.parseCitiesFromFileText(
            reader.result as string
          );
          this.chart.options.data[0].dataPoints = Utils.convertCitiesToDataPoints(
            allCities
          );
          this.chart.render();
          this.greedySvc.findGreedyRoute(allCities);
        };
        if (file) {
          reader.readAsText(file);
        }
      })
    );
  }

  /** parseCitiesFromFileText
   * @desc parse a standard TSP file for its list of city nodes and coordinates
   */
  parseCitiesFromFileText(fileText: string): CityNode[] {
    const cityLines: string[] = fileText
      .split('\n')
      .filter((line: string, index: number) => index > 6 && line);
    const cities: CityNode[] = cityLines.map((line: string) => {
      const lineParts = line.split(' ');
      return new CityNode(lineParts[0], +lineParts[1], +lineParts[2]);
    });
    return cities;
  }

  /** reset
   * @desc clear all forms and chart animations
   */
  reset(): void {
    this.tspFileCtrl.reset();
    this.chart.options.data.forEach(
      (dataSet: any) => (dataSet.dataPoints = [])
    );
    this.chart.render();
    this.results.next(undefined);
    this.greedySvc.clearTimeouts();
  }

  /** mapListOfCityNames
   * @desc map a list of city nodes to a list of city names
   */
  mapListOfCityNames(cityList: CityNode[]): string[] {
    return cityList.map((city: CityNode) => city.name);
  }
}
