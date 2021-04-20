import "./App.css";
import Layout, { Header } from "antd/lib/layout/layout";
import { Button, message, Space, Typography, Upload } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, MeshProps, useFrame } from "react-three-fiber";
import Piano from "./components/Piano";
import Modal from "antd/lib/modal/Modal";
import { InboxOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/lib/upload/interface";
import { MIDINoteToTone, Note, RawNote } from "./utils/note";
import Notes from "./components/Notes";
import { ToneName } from "./utils/tone";
import Boxes from "./components/Boxes";
import MidiFile from "midi-file";
import { Parsed } from "./midiType";

const startNatural = {
  octave: 0,
  tone: ToneName.A,
};
const endNatural = {
  octave: 8,
  tone: ToneName.C,
};

function parseRaws(buffer: Uint8Array): RawNote[]
{
  const parsed = MidiFile.parseMidi(buffer) as Parsed;
  console.log('parsed', parsed);
  return [];
}

function App() {
  const [pressedList, setPressedList] = useState<boolean[] | null>(null);
  const [file, setFile] = useState<UploadFile | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [notes, setNotes] = useState<Note[] | null>(null);

  return (
    <div className="App">
      <Modal
        visible={modalVisible}
        title="MIDI 파일 업로드"
        onOk={async () => {
          message.info("파일 로드 시작");
          if (file === null) {
            message.error("업로드 완료 후 버튼을 눌러주세요.");
            return;
          }
          try {
            setModalVisible(false);
            const buffer = await file.originFileObj.arrayBuffer();
            const raws: RawNote[] = parseRaws(new Uint8Array(buffer));
            setNotes(
              raws.map((r) => ({
                tone: MIDINoteToTone(r.midiId),
                start: r.start,
                end: r.end,
              }))
            );  
          }
          catch {
            message.error("파일 로드 실패");
            setFile(null);
            return;
          }
          message.success("파일 로드 성공");
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text>MIDI 파일을 업로드해주세요.</Typography.Text>
          <Upload.Dragger
            name="file"
            multiple={false}
            customRequest={(e) => {
              e.onSuccess({}, new XMLHttpRequest());
            }}
            onChange={(e) => {
              setFile(e.file);
            }}
            fileList={file === null ? [] : [file]}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              클릭하거나 파일을 드래그해서 업로드
            </p>
            <p className="ant-upload-hint">1개의 MIDI 파일을 업로드해주세요.</p>
          </Upload.Dragger>
          <Typography.Text>
            업로드 완료 후 확인 버튼을 눌러주세요.
          </Typography.Text>
        </Space>
      </Modal>
      <Layout>
        <Header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space size={8}>
              <Typography.Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                MIDI Visualizer
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "white",
                  fontSize: 18,
                }}
              >
                | UGRP
              </Typography.Text>
            </Space>
            <Space size={8}>
              <Typography.Text
                style={{ width: 100, color: "white" }}
                ellipsis={true}
              >
                {file?.name ?? ""}
              </Typography.Text>
              <Button
                onClick={() => {
                  setFile(null);
                  setModalVisible(true);
                }}
              >
                새 파일 열기
              </Button>
            </Space>
          </div>
        </Header>
        <div className="Render">
          <Canvas
            gl={{ antialias: true, alpha: false }}
            camera={{ position: [0, -4, 3.5], fov: 70, near: 2, far: 120 }}
          >
            <color attach="background" args={["white"]} />
            <ambientLight />
            <spotLight
              castShadow
              angle={Math.PI / 2}
              intensity={0.8}
              position={[0, 0, 5]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[10, 1000]} />
              <meshBasicMaterial
                color="orange"
                fog={false}
                transparent
                opacity={0.1}
              />
            </mesh>
            <Piano
              width={10}
              startNatural={startNatural}
              endNatural={endNatural}
              groupProps={{ position: [0, -1.3, 0.3] }}
            ></Piano>
            {notes !== null && (
              <Notes
                width={10}
                startNatural={startNatural}
                endNatural={endNatural}
                velocity={1.8}
                notes={notes}
              ></Notes>
            )}
          </Canvas>
        </div>
      </Layout>
    </div>
  );
}

export default App;
