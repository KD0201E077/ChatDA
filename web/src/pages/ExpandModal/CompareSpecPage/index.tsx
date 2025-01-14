import { useEffect, useState } from "react";
import { request } from "@src/apis/requestBuilder";
import * as Comp from "@root/src/components";
import * as S from "./style";
import * as T from "@src/types/index";
import makeNumberWithCommas from "@src/utils/makeNumberWithCommas";

export default function CompareSpecPage({ selectedModelNo }: { selectedModelNo: string[] }) {
  const [recommendPropsList, setRecommendPropsList] = useState<T.ChatbotRecommendCardProps[]>([]);
  const [summarySpecList, setSummarySpecList] = useState<T.SummarySpecType[]>([]);
  const [sizeSpecList, setSizeSpecList] = useState<T.SummarySpecType[]>([]);
  const [rawSpecList, setRawSpecList] = useState([]);
  // const rawSpecObjectList = useRef([])

  const initState = () => {
    setRecommendPropsList([]);
    setSummarySpecList([]);
    setSizeSpecList([]);
    setRawSpecList([]);
  };

  const getData = async (modelNo: string) => {
    const res = await request.get(`/model?modelNo=${modelNo}`);
    const { data } = res;
    return data;
  };

  const setDatas = (data) => {
    setRecommendPropsList((recommendPropsList) => [
      ...recommendPropsList,
      {
        제품_코드: data["제품_코드"],
        제품명: data["제품명"],
        가격: data["가격"],
        혜택가: makeNumberWithCommas(data["할인가"]),
        imageUrl: data["imageUrl"],
      },
    ]);
    setSummarySpecList((summarySpecList) => [
      ...summarySpecList,
      {
        가로: data["가로"],
        높이: data["높이"],
        깊이: data["깊이"],
        제품_타입: data["제품_타입"],
        설치_타입: data["raw"]["설치 타입"],
        소비효율등급: data["소비효율등급"],
        오토_오픈_도어: data["raw"]["오토 오픈 도어"],
        투명_도어: data["raw"]["투명 도어"],
        베버리지_센터: data["raw"]["베버리지 센터"],
        푸드_쇼케이스: data["raw"]["푸드 쇼케이스"],
        얼음_종류: data["raw"]["얼음 종류"],
        제빙기: data["raw"]["제빙기"],
        탈취기: data["raw"]["탈취기"],
        쿨링커버: data["raw"]["쿨링커버"],
        SmartThings_모바일_앱_지원: data["raw"]["SmartThings 모바일 앱 지원"],
      },
    ]);
    setSizeSpecList((sizeSpecList) => [
      ...sizeSpecList,
      {
        가로: data.가로,
        높이: data.높이,
        깊이: data.깊이,
        제품_타입: data.제품_타입,
        설치_타입: data["raw"]["설치 타입"],
      },
    ]);
    setRawSpecList((rawSpecList) => [...rawSpecList, data.raw]);
  };

  useEffect(() => {
    initState();
    const promises = selectedModelNo.map((modelNo) => getData(modelNo));
    Promise.all(promises).then((json) => {
      json.forEach((data) => {
        setDatas(data);
      });
    });
    // eslint-disable-next-line
  }, [selectedModelNo]);

  useEffect(() => {
    console.log(summarySpecList);
    // A제품 스펙 key U B제품 스펙 key U C제품 스펙 key ...
    const specListKeysSet = new Set();

    summarySpecList.forEach((specList) => {
      Object.keys(specList).forEach((key) => {
        if (!specList[key] || specList[key] === "없음") {
          delete specList[key];
        } else {
          specListKeysSet.add(key);
        }
      });
    });

    [...specListKeysSet].forEach((key: string) => {
      summarySpecList.forEach((specList, i) => {
        if (!specList[key] || specList[key] === "없음") {
          const newSpecList = summarySpecList[i];
          newSpecList[key] = "---";
          setSummarySpecList([
            ...summarySpecList.slice(0, i),
            newSpecList,
            ...summarySpecList.slice(i + 1, summarySpecList.length),
          ]);
        }
      });
    });
    console.log("받은 summarySpec들 !!", summarySpecList);

    // raw data 정제
    const rawSpecListKeysSet = new Set();

    rawSpecList.forEach((specList) => {
      Object.keys(specList).forEach((key) => {
        if (!specList[key] || specList[key] === "없음") {
          delete specList[key];
        } else {
          rawSpecListKeysSet.add(key);
        }
      });
    });

    // for (let i; i < selectedModelNo.length; i++) {
    //   rawSpecObjectList.current.push([])
    // }

    [...rawSpecListKeysSet].forEach((key: string) => {
      rawSpecList.forEach((specList, j) => {
        if (!specList[key] || specList[key] === "없음") {
          const newSpecList = rawSpecList[j];
          newSpecList[key] = "---";
          setRawSpecList([
            ...rawSpecList.slice(0, j),
            newSpecList,
            ...rawSpecList.slice(j + 1, rawSpecList.length),
          ]);
        } else {
          const newSpecList = rawSpecList[j];
          newSpecList[key] = rawSpecList[key];
          setRawSpecList([
            ...rawSpecList.slice(0, j),
            newSpecList,
            ...rawSpecList.slice(j + 1, rawSpecList.length),
          ]);
        }
      });
    });
    console.log("받은 rawSpec들 !!", rawSpecList);
    // eslint-disable-next-line
  }, [summarySpecList]);

  return (
    <>
      <S.ModalHeaderWrapper>
        <S.ModalHeaderSpan>자세히 비교하기</S.ModalHeaderSpan>
        {recommendPropsList.length !== 0 && (
          <Comp.SpecCompareGrid
            recommendProps={recommendPropsList}
            sizeSpec={sizeSpecList}
            summarySpec={summarySpecList}
            rawSpec={rawSpecList}
          />
        )}
      </S.ModalHeaderWrapper>
    </>
  );
}
