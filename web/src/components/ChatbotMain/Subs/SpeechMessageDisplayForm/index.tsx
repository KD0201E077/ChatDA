import * as S from "./style";

export default function SpeechMessageDisplayForm({ message }: { message: string }) {
  return (
    <S.InputForm className="message-form">
      <S.InputWrapper>
        {/* TODO: 마이크 아이콘 표시하기? */}
        <S.InputTextarea value={message} className="message-input" />
      </S.InputWrapper>
    </S.InputForm>
  );
}
