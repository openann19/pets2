import { demoPets } from '../fixtures/pets';
import { demoMatches, demoLikedYou } from '../fixtures/matches';
import { demoChatThread, demoQuickReplies } from '../fixtures/chatThreads';
import { demoPremiumStates } from '../fixtures/premiumStates';
import { demoMapPins } from '../fixtures/mapPins';
import { demoAdoptionItems } from '../fixtures/adoptionItems';

type DemoResourceKey =
  | 'pets'
  | 'matches'
  | 'likedYou'
  | 'chatThread'
  | 'chatQuickReplies'
  | 'premiumStates'
  | 'mapPins'
  | 'adoptionItems';

const demoResourceMap: Record<DemoResourceKey, unknown> = {
  pets: demoPets,
  matches: demoMatches,
  likedYou: demoLikedYou,
  chatThread: demoChatThread,
  chatQuickReplies: demoQuickReplies,
  premiumStates: demoPremiumStates,
  mapPins: demoMapPins,
  adoptionItems: demoAdoptionItems,
};

export const fetchDemoData = (type: DemoResourceKey): unknown => demoResourceMap[type];

export const stubNetworkCall = (type: DemoResourceKey): Promise<unknown> =>
  Promise.resolve(fetchDemoData(type));