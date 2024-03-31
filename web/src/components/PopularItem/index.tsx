import * as S from "./style";
import * as T from "@src/types";
import * as Comp from "@src/components";
import * as API from "@src/apis";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function PopularItem(props: T.PopularItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  let summaryInfo = "";

  const queryKey = [`review-summary-${props.제품_코드}`];
  const { data: response } = useQuery({
    queryKey: queryKey,
    queryFn: () => API.popularItem.getReviewSummary({ modelNo: props.제품_코드 }),
  });
  let cnt = 0;
  let word = "";
  let price = "";
  for (let i = props.가격.length - 3; i >= 0; i--) {
    cnt++;
    price = props.가격[i];
    if (cnt % 3 == 0) {
      price = "," + price;
    }
    price += word;
    word = price;
  }

  summaryInfo = response?.data.content;

  return (
    <S.PopularItemWrapper>
      <S.RankWrapper>
        <span>{props.rank + 1}</span>
      </S.RankWrapper>
      <S.PopularItemDiv>
        <S.AccordionWrapper expanded={isExpanded}>
          {window.innerWidth > 800 && (
            <S.AccordionSummaryWrapper id="panel1-header" aria-controls="panel-content">
              <S.ImgContentWrapper>
                <img src={props.imageUrl} alt="popular-product" width={200} height={142} />
                <S.ContentDiv isExpanded={isExpanded}>
                  <S.ProductNameWrapper>
                    <S.ProductName>{props.제품명}</S.ProductName>
                    <S.ProductModelNo>{props.제품_코드}</S.ProductModelNo>
                  </S.ProductNameWrapper>
                  <S.ReviewPriceWrapper>
                    <S.ReviewWrapper>
                      <Comp.StartRate props={props.평점.slice(0, 3)} />
                      <S.RatingSpan>{props.평점.slice(0, 3)}</S.RatingSpan>
                      <S.ReviewCount>({props.리뷰_개수}건)</S.ReviewCount>
                    </S.ReviewWrapper>
                    <S.PriceWrapper>
                      <S.PriceHead>혜택가</S.PriceHead>
                      <S.Price>{word}원</S.Price>
                    </S.PriceWrapper>
                  </S.ReviewPriceWrapper>
                  {isExpanded && (
                    <S.AccordionDetailsWrapper>
                      <S.ReviewSummaryHead>ChatDA가 요약한 리뷰!!</S.ReviewSummaryHead>
                      <S.ReviewSummary>{summaryInfo}</S.ReviewSummary>
                    </S.AccordionDetailsWrapper>
                  )}
                </S.ContentDiv>
              </S.ImgContentWrapper>
            </S.AccordionSummaryWrapper>
          )}
          {window.innerWidth <= 800 && (
            <S.AccordionSummaryMobileWrapper>
              <S.MobileDiv>
                <S.ImgContentWrapper>
                  <img src={props.imageUrl} alt="popular-product" width={200} height={142} />
                  <S.ContentMobileDiv>
                    <S.ProductNameWrapper>
                      <S.ProductName>{props.제품명}</S.ProductName>
                      <S.ProductModelNo>{props.제품_코드}</S.ProductModelNo>
                    </S.ProductNameWrapper>
                    <S.ReviewWrapper>
                      <Comp.StartRate props={props.평점.slice(0, 3)} />
                      <S.RatingSpan>{props.평점.slice(0, 3)}</S.RatingSpan>
                      <S.ReviewCount>({props.리뷰_개수}건)</S.ReviewCount>
                    </S.ReviewWrapper>
                    <S.PriceWrapper>
                      <S.PriceHead>혜택가</S.PriceHead>
                      <S.Price>{word}원</S.Price>
                    </S.PriceWrapper>
                  </S.ContentMobileDiv>
                </S.ImgContentWrapper>
                <S.ExpandMoreIconWrapper onClick={toggleAccordion}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </S.ExpandMoreIconWrapper>
              </S.MobileDiv>
              {isExpanded && (
                <S.AccordionDetailsMobileWrapper>
                  <S.ReviewSummaryHead>ChatDA가 요약한 리뷰!!</S.ReviewSummaryHead>
                  <S.ReviewSummary>{summaryInfo}</S.ReviewSummary>
                </S.AccordionDetailsMobileWrapper>
              )}
            </S.AccordionSummaryMobileWrapper>
          )}
        </S.AccordionWrapper>
      </S.PopularItemDiv>
    </S.PopularItemWrapper>
  );
}
