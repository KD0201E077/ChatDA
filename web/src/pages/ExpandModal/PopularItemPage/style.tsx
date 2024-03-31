import styled from "@emotion/styled";

export const ModalHeaderWrapper = styled.div`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;

  @media screen and (max-width: 800px) {
    gap: 7px;
    align-items: start;
  }
`;

export const ModalHeaderSpan = styled.span`
  font-size: 36px;
  font-weight: bold;

  @media screen and (max-width: 800px) {
    font-size: 24px;
  }
`;

export const ModalHeaderSubSpan = styled.span`
  font-size: 16px;
  font-weight: 400;
  @media screen and (max-width: 800px) {
    font-size: 14px;
  }
`;

export const ModalPopularItemWrapper = styled.div`
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
