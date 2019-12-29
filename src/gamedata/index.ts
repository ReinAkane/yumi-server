// gamedata is the service that fetches static game data
import * as repository from './repository';
import {
    EnemyData, CharacterData, ActionCardData, PositionCardData,
} from './types';

export function getStarterCharacterIds(): readonly string[] {
    return repository.getStarterCharacterIds();
}

export function getStarterDemonIds(): readonly string[] {
    return repository.getStarterDemonIds();
}

export function getEnemy(enemyId: string): EnemyData {
    return repository.getEnemy(enemyId);
}

export function getCharacter(characterId: string): CharacterData {
    return repository.getCharacter(characterId);
}

export function getActionCard(actionCardId: string): ActionCardData {
    return repository.getActionCard(actionCardId);
}

export function getPositionCard(positionCardId: string): PositionCardData {
    return repository.getPositionCard(positionCardId);
}

export * from './types';
