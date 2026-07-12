import { config } from '../../lib/config.js';
import { MockProvider } from './mock.js';
import { FashnProvider } from './fashn.js';
import { ReplicateProvider } from './replicate.js';

let cached = null;

export function getProvider() {
  if (cached) return cached;
  switch ((config.ai.provider || 'mock').toLowerCase()) {
    case 'fashn': cached = new FashnProvider(); break;
    case 'replicate': cached = new ReplicateProvider(); break;
    default: cached = new MockProvider();
  }
  return cached;
}

export const AVAILABLE_PROVIDERS = ['mock', 'fashn', 'replicate'];
