import { registerSystems, run } from './events';
import * as buffs from './buffs';
import * as drawCards from './draw-cards';
import * as moveToPosition from './move-to-position';
import * as attack from './attack';

registerSystems(attack, buffs, drawCards, moveToPosition);

export { run };
