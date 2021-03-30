import { useEffect, useRef, useState } from "react";
import { useFrame } from "react-three-fiber";
import { Note } from "../utils/note";
import {
  chromaticTodiatonic,
  getTones,
  isNaturalTone,
  isValidTone,
  Tone,
  ToneName,
} from "../utils/tone";
import * as THREE from "three";
import { CuboidInfo } from "../utils/cuboid";

type Props = {
  startNatural: Tone;
  endNatural: Tone;
  velocity: number;
  notes: Note[];
  width: number;
};

const tempObject = new THREE.Object3D();

export default function Notes({
  startNatural,
  endNatural,
  velocity,
  notes,
  width,
}: Props) {
  const [t, setT] = useState(0);
  const [restart, setRestart] = useState(false);
  const ref = useRef<any>();

  useEffect(() => {
    setRestart(true);
  }, [notes]);

  useEffect(() => {
    const startNaturalTone =
      isValidTone(startNatural) && isNaturalTone(startNatural as Tone)
        ? (startNatural as Tone)
        : {
            tone: ToneName.A,
            octave: 0,
          };
    const endTone =
      isValidTone(endNatural) && isNaturalTone(endNatural as Tone)
        ? (endNatural as Tone)
        : {
            tone: ToneName.C,
            octave: 8,
          };

    const _tones = getTones(startNaturalTone, endTone);
    const _numNatural = _tones.filter((t) => isNaturalTone(t)).length;
    const _t = width / (5 * _numNatural - 1);
    setT(_t);
  }, [startNatural, endNatural]);

  const getCuboidInfo = (note: Note, time: number): CuboidInfo => {
    const { tone } = note;
    const startInd =
      chromaticTodiatonic(startNatural.tone) + startNatural.octave * 7;
    const currentInd = chromaticTodiatonic(tone.tone) + tone.octave * 7;
    const ind = currentInd - startInd;

    const yLen = ((note.end - note.start) / 1000) * velocity;
    const posY = ((note.end + note.start - time) / 2000) * velocity;

    if (isNaturalTone(tone)) {
      return {
        x: -width / 2 + 5 * t * ind + 2 * t,
        y: posY,
        z: 0.1,
        xLen: t * 4,
        yLen,
        zLen: 0.2,
      };
    } else {
      return {
        x: -width / 2 + 5 * t * ind + 4.5 * t,
        y: posY,
        z: 0.28,
        xLen: t * 4,
        yLen,
        zLen: 0.16,
      };
    }
  };

  useFrame((state) => {
    if (restart) {
      state.clock.start();
      setRestart(false);
    }

    if (ref.current !== undefined) {
      const time = state.clock.getElapsedTime() * 1000;
      notes.forEach((note, ind) => {
        const i = getCuboidInfo(note, time);
        tempObject.position.set(i.x, i.y, i.z);
        tempObject.scale.set(i.xLen, i.yLen, i.zLen);
        tempObject.updateMatrix();
        ref.current.setMatrixAt(ind, tempObject.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={ref} args={[null, null, notes.length]}>
      <boxBufferGeometry args={[1, 1, 1]} attach="geometry" />
      <meshPhongMaterial
        attach="material"
        color={"#ff3b1e"}
      ></meshPhongMaterial>
    </instancedMesh>
  );
}
