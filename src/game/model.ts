export const SYMBOL_IDS = [
  'apple',
  'bar',
  'bell',
  'cherry',
  'clover',
  'coin',
  'diamond',
  'die',
  'grapefruit',
  'heart',
  'horseshoe',
  'lemon',
  'orange',
  'plum',
  'seven',
  'watermelon',
] as const;

export type SymbolId = typeof SYMBOL_IDS[number];

export type Column = readonly [
  SymbolId,
  SymbolId,
  SymbolId,
];

export type Matrix = readonly [
  Column,
  Column,
  Column,
];

export type Row = 0 | 1 | 2;

export type Payline = readonly [Row, Row, Row];

export type WinningLine = {
  lineIndex: number;
  symbolId: SymbolId;
};
