import * as Comp from "@root/src/components";
import * as S from "./style";
import * as T from "@root/src/types";
import * as API from "@src/apis";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function PopularItemPage() {
  const queryKey = ["ranking-list"];
  const { data: response } = useQuery({
    queryKey: queryKey,
    queryFn: () => API.popularItem.getPopularList(),
  });

  useEffect(() => {
    console.log(response);
  }, [response]);

  const PIProps: T.PopularItemProps[] = response?.data.modelList;

  return (
    <>
      <S.ModalHeaderWrapper>
        <S.ModalHeaderSpan>ChatDA 인기순위</S.ModalHeaderSpan>
        <S.ModalHeaderSubSpan>ChatDA에서 많이 검색한 상품을 알려드릴게요!</S.ModalHeaderSubSpan>
      </S.ModalHeaderWrapper>
      <S.ModalPopularItemWrapper>
        {PIProps &&
          PIProps.map((popularItemProps: T.PopularItemProps, index: number) => {
            return <Comp.PopularItem {...popularItemProps} rank={index} key={index} />;
          })}
      </S.ModalPopularItemWrapper>
    </>
  );
}
