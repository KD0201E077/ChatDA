import { usePorcupine } from "@picovoice/porcupine-react";
import { useCallback, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { hi_ppn } from "../assets/porcupine/hi_ppn";
import { ko_pv } from "../assets/porcupine/ko_pv";

export interface SpeechInputReturnType {
  /**
   * 현재 환경이 SpeechInput을 지원하는지 여부. 컴포넌트 로드 과정에서 값이 변경될 수 있습니다.
   */
  supports: boolean;
  /**
   * SpeechInput이 호출어 대기 상태인지 여부.
   */
  isWaiting: boolean;
  /**
   * SpeechInput이 음성 인식 상태인지 여부.
   */
  isListening: boolean;
  /**
   * SpeechInput이 음성 인식 완료 상태인지 여부.
   */
  isCompleted: boolean;
  /**
   * SpeechInput이 인식한 음성 내용. `isCompleted` 상태에서만 사용해야 합니다. `isListening` 상태에서만 변경됩니다.
   */
  content: string;
  /**
   * SpeechInput을 초기화합니다. 초기화 완료 후 대기 상태로 변경합니다.
   */
  init: () => Promise<void>;
  /**
   * SpeechInput를 대기 상태로 변경합니다. `isCompleted`이 `true`인 경우에만 호출 가능합니다; 아닐 경우 예외를 발생합니다.
   */
  start: () => void;
}

const States = {
  LOADING: "LOADING",
  TO_WAITING: "TO_WAITING",
  WAITING: "WAITING",
  TO_LISTENING: "TO_LISTENING",
  LISTENING: "LISTENING",
  COMPLETED: "COMPLETED",
};

/**
 * `init` 완료 후 대기 상태로 변경됩니다.
 * - isWaiting: 키워드 대기 상태, 키워드를 확인하면 음성 인식 상태로 변경됩니다.
 * - isListening: 음성 인식 상태, 인식 내용을 `content`에 반영합니다. 입력을 종료하면 완료 상태로 변경됩니다.
 * - isCompleted: 완료 상태, `start`를 호출하여 대기 상태로 변경할 수 있습니다.
 */
export const useSpeechInput = (): SpeechInputReturnType => {
  const {
    keywordDetection,
    isListening: isPorcupineListening,
    init: initPorcupine,
    start: startPorcupine,
    stop: stopPorcupine,
    error,
  } = usePorcupine();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const [supports, setSupports] = useState(false);
  const [thisState, setThisState] = useState(States.LOADING);
  const [content, setContent] = useState("");

  const init = useCallback(async () => {
    try {
      const { VITE_PICO_ACCESS_KEY } = import.meta.env;
      await initPorcupine(
        VITE_PICO_ACCESS_KEY,
        // customKeyword파일을 입력해주는 파라미터로 public path에 ppn파일을 넣고 파일 명을 적어주면 됩니다.
        // 주의해야 할 점은 반드시 keyword에는 label을 붙여줘야 나중에 keyword Detection이 됐을때 인식이 됩니다.
        // 키워드 파일: https://github.com/Picovoice/porcupine/tree/master/resources/keyword_files/wasm
        // 커스텀 키워드 생성: https://console.picovoice.ai/
        {
          // 하이삼닷 : hi.ppn, 헬로우삼닷 : hello.ppn
          base64: hi_ppn,
          label: "hi",
        },
        // 3번째 파라미터는 인식을 위해 사용할 모델을 입력받는 파라미터입니다.
        // 우리는 한국어를 사용할 것이기 때문에 한국어 모델을 사용해줍니다.
        // 언어별 모델 파일: https://github.com/Picovoice/porcupine/tree/master/lib/common
        {
          base64: ko_pv,
        },
      );
      _startWaiting();
    } catch (err) {
      console.error("Failed to initialize Porcupine:", err);
    }
  }, [initPorcupine]);

  // // TODO: DEBUG
  // useEffect(() => {
  //   console.log(thisState);
  // }, [thisState]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const start = () => {
    if (thisState !== States.COMPLETED) {
      throw new Error("start() called on isCompleted = false");
    }
    _startWaiting();
  };

  const _startWaiting = () => {
    startPorcupine();
    setThisState(States.TO_WAITING);
  };

  const _startListening = () => {
    stopPorcupine();
    resetTranscript();
    setContent("");
    keywordDetection.index = -1;
    SpeechRecognition.startListening({
      language: "ko-KR",
      continuous: false,
    });
    setThisState(States.TO_LISTENING);
  };

  const _stopListening = () => {
    SpeechRecognition.stopListening();
    setThisState(States.COMPLETED);
  };

  // supports 상태 관리
  useEffect(() => {
    setSupports(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  // Porcupine이 실행될 때까지 waiting 상태 전이 대기
  useEffect(() => {
    if (thisState === States.TO_WAITING && isPorcupineListening === true) {
      setThisState(States.WAITING);
    }
  }, [thisState, isPorcupineListening]);

  // waiting 상태에서 키워드가 인식되면 listening 상태로 전이 (키워드가 인식되면 isPorcupineListening이 false로 변경됨)
  useEffect(() => {
    if (thisState === States.WAITING && keywordDetection?.index >= 0) {
      _startListening();
    }
  }, [thisState, keywordDetection]);

  // SpeechRecognition이 실행될 때까지 listening 상태 전이 대기
  useEffect(() => {
    if (thisState === States.TO_LISTENING && listening) {
      setThisState(States.LISTENING);
    }
  }, [thisState, listening]);

  // listening 상태에서 SpeechRecognition이 종료되면 completed 상태로 전이 (SpeechRecognition은 사용자 발화가 종료되면 자동으로 종료)
  useEffect(() => {
    if (thisState === States.LISTENING && !listening) {
      _stopListening();
      // 인식한 내용이 없으면 다시 인식 시작
      if (content.trim() === "") {
        _startListening();
      }
    }
  }, [thisState, listening]);

  // listening 상태일 때 음성 인식 content 업데이트
  useEffect(() => {
    if (thisState === States.LISTENING) {
      setContent(transcript);
    }
  }, [thisState, transcript]);

  return {
    supports,
    isWaiting: thisState === States.WAITING,
    isListening: thisState === States.LISTENING,
    isCompleted: thisState === States.COMPLETED,
    content,
    init,
    start,
  };
};
