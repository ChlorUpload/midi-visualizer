import { Tone, ToneName } from "./tone";

export const MIDINoteToTone = (midiId: number): Tone => {
  const ind = midiId - 12;
  return {
    octave: Math.floor(ind / 12),
    tone: (ind % 12) as ToneName,
  };
};

export type RawNote = {
  midiId: number;
  start: number;
  end: number;
};

export type Note = {
  tone: Tone;
  start: number;
  end: number;
};
