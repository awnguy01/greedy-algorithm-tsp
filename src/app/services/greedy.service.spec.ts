import { TestBed } from '@angular/core/testing';

import { GreedyService } from './greedy.service';

describe('GreedyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GreedyService = TestBed.get(GreedyService);
    expect(service).toBeTruthy();
  });
});
