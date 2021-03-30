export enum ToneName {
  C = 0,
  CSharp,
  D,
  DSharp,
  E,
  F,
  FSharp,
  G,
  GSharp,
  A,
  ASharp,
  B,
}

export type Tone = {
  tone: ToneName;
  octave: number;
};

export function chromaticTodiatonic(name: ToneName): number {
  const map: { name: ToneName; ind: number }[] = [
    {
      name: ToneName.CSharp,
      ind: 0,
    },
    { name: ToneName.DSharp, ind: 1 },
    { name: ToneName.E, ind: 2 },
    { name: ToneName.FSharp, ind: 3 },
    { name: ToneName.GSharp, ind: 4 },
    { name: ToneName.ASharp, ind: 5 },
    { name: ToneName.B, ind: 6 },
  ];
  for (const m of map) {
    if (name <= m.name) return m.ind;
  }
  return -1;
}

export function isNaturalTone(tone: Tone): boolean {
  switch (tone.tone) {
    case ToneName.CSharp:
    case ToneName.DSharp:
    case ToneName.FSharp:
    case ToneName.GSharp:
    case ToneName.ASharp:
      return false;
    default:
      return true;
  }
}

export function isValidTone(tone: Tone | undefined): boolean {
  if (tone === undefined) return false;

  const ind = tone.tone + tone.octave * 12;

  // 최소인 A0의 경우 9, 최대인 C8의 경우 96
  return ind >= 9 && ind <= 96;
}

export function getTones(startTone: Tone, endTone: Tone): Tone[] {
  const startInd = startTone.tone + startTone.octave * 12;
  const endInd = endTone.tone + endTone.octave * 12;

  const retTones: Tone[] = [];
  for (let i = startInd; i <= endInd; i++) {
    retTones.push({
      octave: Math.floor(i / 12),
      tone: i % 12,
    });
  }

  return retTones;
}
