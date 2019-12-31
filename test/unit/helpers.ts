import Chance from 'chance';
import * as databaseRepo from '../../src/database/repository';
import * as stateRepo from '../../src/state/repository';

afterEach(() => {
    databaseRepo.reset();
    stateRepo.reset();
});

export const chance = new Chance();
