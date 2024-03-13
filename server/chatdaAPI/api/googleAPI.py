from google.cloud import texttospeech
from google.oauth2 import service_account


def tts(text):
    try:
        # 사용자 인증 정보 로드
        credentials = service_account.Credentials.from_service_account_file('google-cloud-key.json')
        client = texttospeech.TextToSpeechClient(credentials=credentials)

    except Exception as e:
        raise Exception("인증 정보 오류")

    try:    
        # 입력 받은 텍스트를 TTS의 입력으로 넣습니다
        input_text = texttospeech.SynthesisInput(text=text)

        # 오디오 설정 (예제에서는 한국어, 남성C)
        voice = texttospeech.VoiceSelectionParams(
            language_code="ko-KR",
            name="ko-KR-Neural2-C",
            ssml_gender=texttospeech.SsmlVoiceGender.MALE,
        )
        
        # 인코딩 형식을 MP3로 지정
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        # API 호출 및 음성 변환
        response = client.synthesize_speech(
            request={"input": input_text, "voice": voice, "audio_config": audio_config}
        )
    except Exception as e:
        raise Exception("Google Cloud API 호출 오류")
    
    try:
        # output.mp3라는 이름으로 파일 생성
        with open("output.mp3", "wb") as out:
            out.write(response.audio_content)
    except Exception as e:
        raise Exception("음성 파일 저장 오류")
    
if __name__ == "__main__":
    synthesize_text("테스트 입니다")
