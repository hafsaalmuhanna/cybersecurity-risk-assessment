/**
 * Virtual Try-On provider interface.
 *
 * Every provider implements:
 *   async generate(input) -> { resultUrl, meta }
 *
 * input = {
 *   garmentUrl:     absolute/relative URL of the flat-lay garment image (required)
 *   category:       'top' | 'bottom' | 'dress' | 'abaya' | 'accessory'
 *   modelImageUrl:  URL of the house model photo (when trying on a house model)
 *   shopperPhoto:   data URL / URL of the customer's own photo (optional)
 *   hijab:          boolean
 *   pose:           string
 *   title:          product title (for logging / mock art)
 * }
 *
 * Providers should be stateless and cheap to construct. Network/errors throw.
 */
export class TryOnProvider {
  get name() { return 'base'; }
  // eslint-disable-next-line no-unused-vars
  async generate(input) {
    throw new Error('not implemented');
  }
}
