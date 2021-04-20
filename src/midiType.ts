export type Parsed = {
  header: {
    format: number;
    numTracks: number;
    ticksPerBeat: number;
  };
  tracks: Events[];
};

type Events = (
    | TimeSignatureEvent
    | SetTempoEvent
    | NoteOn
    | ProgramChangeEvent
    | NoteOff
  )[];

type Event<T> = {
  deltaTime: number;
  type: T;
};

type TimeSignatureEvent = Event<"timeSignature"> & {
  denominator: number;
  meta: boolean;
  metronome: number;
  numerator: number;
  thirtyseconds: number;
};

type SetTempoEvent = Event<"setTempo"> & {
  meta: boolean;
  microsecondsPerBeat: number;
};

type ProgramChangeEvent = Event<"programChange"> & {
  channel: number;
  programNumber: number;
};

type Note = {
  channel: number;
  noteNumber: number;
  velocity: number;
};

type NoteOn = Event<"noteOn"> & Note;
type NoteOff = Event<"noteOff"> & Note;
