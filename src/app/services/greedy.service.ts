import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CityNode } from '../classes/models/city-node';
import { Utils } from '../classes/utils';
import { LineSegment } from '../classes/models/line-segment';
import { Results } from '../classes/models/results';
import { PointLineDistResults } from '../classes/models/point-line-dist-results';

@Injectable({
  providedIn: 'root'
})
export class GreedyService {
  results = new BehaviorSubject<Results | undefined>(undefined);
  timeouts = [];

  constructor() {}

  /** findGreedyRoute
   * @desc main algorithm to find the Hamiltonian path using a greedy approach
   */
  findGreedyRoute(allCities: CityNode[]): void {
    // Initialize results with starting route
    this.results.next(this.initResults(allCities));

    let results = this.results.getValue();

    // Used for animation
    let timeout = 0;
    const timeInterval = 250;

    while (results.remCities.length) {
      const edges: LineSegment[] = Utils.findAllEdges(results.currRoute);
      let minDistance = 0;
      let minCity: CityNode | undefined;
      let insertIndex = 0;

      // Find min distance from each point to each edge
      edges.forEach((edge: LineSegment, edgeIndex: number) => {
        results.remCities.forEach((testCity: CityNode) => {
          const pointLineDistResults: PointLineDistResults = Utils.calcPointEdgeDistance(
            testCity,
            edge
          );
          const testDistance = pointLineDistResults.distance;
          if (testDistance <= minDistance || !minDistance) {
            // If new point-edge distance found is less or equal than current min distance, replace the min distance
            minDistance = testDistance;
            minCity = testCity;
            if (pointLineDistResults.isPerpToEdge) {
              // If point lies inside edge perpendicular space, insert between edge points
              insertIndex = edgeIndex + 1;
            } else {
              // If point lies outside edge perpendicular space, insert before/after closest edge point
              insertIndex =
                pointLineDistResults.closestEndpoint === 'a'
                  ? edgeIndex
                  : edgeIndex + 2;
            }
          }
        });
      });

      const tmpResults: Results = this.addCityToResults(
        results,
        minCity,
        insertIndex
      );

      // Update outer scope results for while loop
      results = tmpResults;

      // Update global results for animation
      this.timeouts.push(
        setTimeout(() => this.results.next(tmpResults), timeout)
      );

      timeout += timeInterval;
    }

    // Append starting city to end of route to close Hamiltonian path
    this.timeouts.push(
      setTimeout(() => {
        this.results.next(this.finalizeResults(results));
      }, timeout)
    );
  }

  /** chooseInitialCities
   * @desc select a pair of starting cities based on the two with the shortest distance between them
   */
  chooseInitialCities(allCities: CityNode[]): CityNode[] {
    let minDistance = 0;
    let minPair: CityNode[] = [];

    allCities.forEach((city: CityNode) => {
      allCities.forEach((dest: CityNode) => {
        if (city.name !== dest.name) {
          const distance: number = Utils.calcDistance(city, dest);
          if (distance < minDistance || !minDistance) {
            minDistance = distance;
            minPair = [city, dest];
          }
        }
      });
    });

    return minPair;
  }

  /** initResults
   * @desc create an initial Results object with a calculated starting route
   */
  initResults(allCities: CityNode[]): Results {
    const startingRoute = this.chooseInitialCities(allCities);
    const remCities = [...allCities].filter(
      (remCity: CityNode) => !startingRoute.includes(remCity)
    );

    return new Results(
      [...startingRoute],
      [...startingRoute],
      remCities,
      Utils.calcTotalDistance(startingRoute)
    );
  }

  /** addCityToResults
   * @desc return a new Results object updated with a newly added CityNode
   */
  addCityToResults(
    prevResults: Results,
    minCity: CityNode,
    insertIndex: number
  ): Results {
    // Remove chosen min city from remaining cities
    const tmpRemCities: CityNode[] = prevResults.remCities.filter(
      (tmpRemCity: CityNode) => tmpRemCity.name !== minCity.name
    );
    // Append chosen min city to add order
    const tmpAddOrder: CityNode[] = [...prevResults.addOrder, minCity];
    // Insert chosen min city to route at specified location
    const tmpCurrRoute: CityNode[] = [...prevResults.currRoute];
    tmpCurrRoute.splice(insertIndex, 0, minCity);

    return new Results(
      tmpAddOrder,
      tmpCurrRoute,
      tmpRemCities,
      Utils.calcTotalDistance(tmpCurrRoute)
    );
  }

  /** finalizeResults
   * @desc append the starting city to the final route and calculate the final distance
   */
  finalizeResults(currResults: Results): Results {
    const finalRoute: CityNode[] = [
      ...currResults.currRoute,
      currResults.currRoute[0]
    ];
    currResults.currRoute = finalRoute;
    currResults.totalDistance = Utils.calcTotalDistance(finalRoute);
    return currResults;
  }

  /** clearTimeouts
   * @desc utility function clearing any outstanding timers
   */
  clearTimeouts(): void {
    this.timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
  }
}
