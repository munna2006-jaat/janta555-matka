// Backward-compatible alias file redirecting all sync operations to MatkaPulse (https://matkapulse.com/)
import {
  getMatkaPulseSyncStatus,
  syncMatkaPulseResults,
  startMatkaPulseSyncWorker,
  parseMatkaPulseMarkets,
  parseMatkaPulseResult,
  MatkaPulseMarketResult,
  MatkaPulseSyncStatus,
  ParsedMatkaPulseResult
} from './matkaPulseSync';

export type AppaBossMarketResult = MatkaPulseMarketResult;
export type AppaBossSyncStatus = MatkaPulseSyncStatus;
export type ParsedMatkaResult = ParsedMatkaPulseResult;

export const getAppaBossSyncStatus = getMatkaPulseSyncStatus;
export const syncAppaBossResults = syncMatkaPulseResults;
export const startAppaBossSyncWorker = startMatkaPulseSyncWorker;
export const parseAppaBossMarkets = parseMatkaPulseMarkets;
export const parseAppaResult = parseMatkaPulseResult;

export default {
  getAppaBossSyncStatus,
  syncAppaBossResults,
  startAppaBossSyncWorker,
  parseAppaBossMarkets,
  parseAppaResult
};
