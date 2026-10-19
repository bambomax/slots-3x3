import { Assets, type Texture } from 'pixi.js';
import { SYMBOL_IDS, type SymbolId } from './model';

import appleUrl from '../assets/symbols/apple.png';
import barUrl from '../assets/symbols/bar.png';
import bellUrl from '../assets/symbols/bell.png';
import cherryUrl from '../assets/symbols/cherry.png';
import cloverUrl from '../assets/symbols/clover.png';
import coinUrl from '../assets/symbols/coin.png';
import diamondUrl from '../assets/symbols/diamond.png';
import dieUrl from '../assets/symbols/die.png';
import grapefruitUrl from '../assets/symbols/grapefruit.png';
import heartUrl from '../assets/symbols/heart.png';
import horseshoeUrl from '../assets/symbols/horseshoe.png';
import lemonUrl from '../assets/symbols/lemon.png';
import orangeUrl from '../assets/symbols/orange.png';
import plumUrl from '../assets/symbols/plum.png';
import sevenUrl from '../assets/symbols/seven.png';
import watermelonUrl from '../assets/symbols/watermelon.png';

export type SymbolTextures = Readonly<Record<SymbolId, Texture>>;

const SYMBOL_URLS: Record<SymbolId, string> = {
  apple: appleUrl,
  bar: barUrl,
  bell: bellUrl,
  cherry: cherryUrl,
  clover: cloverUrl,
  coin: coinUrl,
  diamond: diamondUrl,
  die: dieUrl,
  grapefruit: grapefruitUrl,
  heart: heartUrl,
  horseshoe: horseshoeUrl,
  lemon: lemonUrl,
  orange: orangeUrl,
  plum: plumUrl,
  seven: sevenUrl,
  watermelon: watermelonUrl,
};

export async function loadSymbolTextures(): Promise<SymbolTextures> {
  const entries = await Promise.all(
    SYMBOL_IDS.map(async (symbolId) => {
      const texture = await Assets.load<Texture>(SYMBOL_URLS[symbolId]);

      return [symbolId, texture] as const;
    }),
  );

  // Every SymbolId is loaded above; fromEntries loses that key information.
  return Object.fromEntries(entries) as SymbolTextures;
}