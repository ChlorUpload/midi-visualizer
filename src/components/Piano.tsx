import { useEffect, useState } from "react";
import produce from "immer";
import { GroupProps } from "react-three-fiber";

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

type CuboidInfo = {
  x: number;
  y: number;
  z: number;
  xLen: number;
  yLen: number;
  zLen: number;
};

function chromaticTodiatonic(name: ToneName): number {
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

function getCuboidInfo(
  tone: Tone,
  t: number,
  width: number,
  startTone: Tone
): CuboidInfo {
  const startInd = chromaticTodiatonic(startTone.tone) + startTone.octave * 7;
  const currentInd = chromaticTodiatonic(tone.tone) + tone.octave * 7;
  const ind = currentInd - startInd;
  if (isNaturalTone(tone)) {
    return {
      x: -width / 2 + 5 * t * ind + 2 * t,
      y: 0,
      z: 1.5 * t,
      xLen: t * 4,
      yLen: t * 32,
      zLen: t * 3,
    };
  } else {
    return {
      x: -width / 2 + 5 * t * ind + 4.5 * t,
      y: 8 * t,
      z: 4 * t,
      xLen: t * 4,
      yLen: t * 16,
      zLen: t * 2,
    };
  }
}

function isNaturalTone(tone: Tone): boolean {
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

function isValidTone(tone: Tone | undefined): boolean {
  if (tone === undefined) return false;

  const ind = tone.tone + tone.octave * 12;

  // 최소인 A0의 경우 9, 최대인 C8의 경우 96
  return ind >= 9 && ind <= 96;
}

function getTones(startTone: Tone, endTone: Tone): Tone[] {
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

export default function Piano({
  width,
  startNatural: start,
  endNatural: end,
  groupProps,
  pressedList,
  setPressedList,
}: Props) {
  const [tones, setTones] = useState<Tone[] | null>(null);
  const [numNatural, setNumNatural] = useState<number | null>(null);
  const [t, setT] = useState<number | null>(null);
  const [onList, setOnList] = useState<boolean[] | null>(null);

  useEffect(() => {
    if (pressedList !== undefined) setOnList(pressedList);
  }, [pressedList]);

  useEffect(() => {
    const startTone =
      isValidTone(start) && isNaturalTone(start as Tone)
        ? (start as Tone)
        : {
            tone: ToneName.A,
            octave: 0,
            sharp: false,
          };
    const endTone =
      isValidTone(end) && isNaturalTone(end as Tone)
        ? (end as Tone)
        : {
            tone: ToneName.C,
            octave: 8,
            sharp: false,
          };

    const _tones = getTones(startTone, endTone);
    const _numNatural = _tones.filter((t) => isNaturalTone(t)).length;
    const _t = width / (5 * _numNatural - 1);
    setTones(_tones);
    setNumNatural(_numNatural);
    setT(_t);
    setOnList(Array.from({ length: _tones.length }, () => false));
  }, [start, end]);

  if (
    tones === null ||
    tones.length === 0 ||
    t === null ||
    onList === null ||
    numNatural === null
  )
    return <group></group>;

  const onDown = (ind: number) => {
    const newList = produce(onList, (draft) => {
      if (draft !== null) draft[ind] = true;
    });
    setOnList(newList);
    if (setPressedList !== undefined) setPressedList(newList);
  };

  const onUp = (ind: number) => {
    const newList = produce(onList, (draft) => {
      if (draft !== null) draft[ind] = false;
    });
    setOnList(newList);
    if (setPressedList !== undefined) setPressedList(newList);
  };

  return (
    <group {...(groupProps ?? {})}>
      {tones?.map((tone) => {
        const ind = tone.tone + tone.octave * 12;
        const i = getCuboidInfo(tone, t, width, tones[0]);
        return (
          <mesh
            onPointerDown={() => {
              onDown(ind);
            }}
            onPointerUp={() => {
              onUp(ind);
            }}
            onPointerOut={() => {
              onUp(ind);
            }}
            key={ind}
            position={[i.x, i.y, i.z]}
          >
            <boxBufferGeometry
              args={[i.xLen, i.yLen, i.zLen]}
              attach="geometry"
            />
            <meshPhongMaterial
              color={isNaturalTone(tone) ? "skyblue" : "#544"}
              attach="material"
              emissive={onList[ind] ? "pink" : "black"}
            />
          </mesh>
        );
      })}
    </group>
  );
}

type Props = {
  width: number;
  startNatural?: Tone;
  endNatural?: Tone;
  groupProps?: GroupProps;
  pressedList?: boolean[];
  setPressedList?: (pressedList: boolean[]) => void;
};
