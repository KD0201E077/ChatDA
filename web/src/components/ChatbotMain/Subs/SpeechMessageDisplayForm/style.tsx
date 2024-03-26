import styled from "@emotion/styled";
import theme from "@assets/style/theme.module.scss";

export const InputForm = styled.form`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const InputTextarea = styled.textarea`
  width: 319px;
  height: 39px;
  font-size: 13px;
  padding: 8px;
  border: 1px solid ${theme.inputbordercolor};
  border-radius: 5px;
  resize: none;
`;
