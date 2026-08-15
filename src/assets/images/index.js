/**
 * Image slot manifest.
 *
 * Slots are named for what the photograph *is*, not for the product it
 * currently sits behind. Reassigning a photo to a different product is then a
 * one-line change here, and renaming the catalog never invalidates the
 * manifest.
 *
 * The photography was cut from two supplied collages (3 + 5 + 7 tiles, then
 * 3 + 4).
 * Products with no photo render as a captioned hairline frame at the correct
 * ratio, so the layout holds either way.
 *
 * To add one:
 *   1. Drop the file into this folder (src/assets/images/).
 *   2. Import it at the top of this file.
 *   3. Add it to IMAGES under a descriptive slot name.
 *   4. Point a product's `image` at that slot in src/data/products.js.
 */

import editorialEntry from './editorial-entry.jpg'
import editorialPreferences from './editorial-preferences.jpg'
import editorialCart from './editorial-cart.jpg'
import editorialJournal from './editorial-journal.jpg'

import bottleCitrus from './bottle-citrus.jpg'
import bottleGreenRain from './bottle-green-rain.jpg'
import bottlesHerbInfused from './bottles-herb-infused.jpg'
import bowlDroppersLavender from './bowl-droppers-lavender.jpg'
import dropperTowels from './dropper-towels.jpg'
import handLemonsMoss from './hand-lemons-moss.jpg'
import handPumpAmber from './hand-pump-amber.jpg'
import pumpFern from './pump-fern.jpg'
import shelfAmberBottles from './shelf-amber-bottles.jpg'
import sprayBlueMarble from './spray-blue-marble.jpg'
import sprayLavender from './spray-lavender.jpg'

import basketPodsLinen from './basket-pods-linen.jpg'
import bottleLavenderBasket from './bottle-lavender-basket.jpg'
import flatlayMintLemon from './flatlay-mint-lemon.jpg'
import foamingPumpLemon from './foaming-pump-lemon.jpg'
import jarTabletsGel from './jar-tablets-gel.jpg'
import shelfSprayMint from './shelf-spray-mint.jpg'
import sprayAmberBrush from './spray-amber-brush.jpg'
import sprayBlueLime from './spray-blue-lime.jpg'

export const IMAGES = {
  // Editorial — full-bleed, landscape 3:2
  'editorial-entry': editorialEntry,
  'editorial-preferences': editorialPreferences,
  'editorial-cart': editorialCart,
  'editorial-journal': editorialJournal,

  // Product photography — portrait 4:5
  'bottle-citrus': bottleCitrus,
  'bottle-green-rain': bottleGreenRain,
  'bottles-herb-infused': bottlesHerbInfused,
  'bowl-droppers-lavender': bowlDroppersLavender,
  'dropper-towels': dropperTowels,
  'hand-lemons-moss': handLemonsMoss,
  'hand-pump-amber': handPumpAmber,
  'pump-fern': pumpFern,
  'shelf-amber-bottles': shelfAmberBottles,
  'spray-blue-marble': sprayBlueMarble,
  'spray-lavender': sprayLavender,

  // Second collage — 3 + 4 tiles
  'basket-pods-linen': basketPodsLinen,
  // Shares a scene with basket-pods-linen, but the two sit in different
  // categories and never appear side by side — unlike the dishwasher pair,
  // where a shared frame would have been obvious.
  'bottle-lavender-basket': bottleLavenderBasket,
  'flatlay-mint-lemon': flatlayMintLemon,
  'foaming-pump-lemon': foamingPumpLemon,
  'jar-tablets-gel': jarTabletsGel,
  'shelf-spray-mint': shelfSprayMint,
  'spray-amber-brush': sprayAmberBrush,
  'spray-blue-lime': sprayBlueLime,
}

/** Editorial slots run landscape; product photography runs portrait. */
export const RATIOS = {
  'editorial-entry': '3 / 2',
  'editorial-preferences': '3 / 2',
  'editorial-cart': '3 / 2',
  'editorial-journal': '3 / 2',
}

export const DEFAULT_RATIO = '4 / 5'

export function imageFor(slot) {
  return (slot && IMAGES[slot]) ?? null
}

export function ratioFor(slot) {
  return RATIOS[slot] ?? DEFAULT_RATIO
}
