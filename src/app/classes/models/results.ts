import { CityNode } from './city-node';

/** Results
 * @desc container for results display
 */
export class Results {
  constructor(
    public addOrder: CityNode[],
    public currRoute: CityNode[],
    public remCities: CityNode[],
    public totalDistance: number
  ) {}
}
