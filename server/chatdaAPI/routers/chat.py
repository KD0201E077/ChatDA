from typing import Union

from fastapi import APIRouter, status, HTTPException

import models.dto.chat.ChatResponseDto as response_dto
import models.dto.chat.ChatRequestDto as request_dto
import models.exmaple_chat as dump
from RAG.make_output import get_output

# prefix == chat
router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED,
             response_model=Union[response_dto.ChatInfoDto, response_dto.ChatCompareDto, response_dto.ChatRecommendDto])
async def post_chat(
        chat_request_dto: request_dto.ChatRequestDto
):
    """
    기본 챗봇과의 대화 API\n
    테스트용 입력 : COMPARE, INFO, RECOMMEND
    입력: ChatRequestDto(uuid, content)\n
    응답: ChatInfoDto, ChatCompareDto, ChatRecommendDto(type, content, modelNoLlist or modelNo)\n
    """

    print(chat_request_dto)
    response = None
    content = chat_request_dto.content
    match content:
        case "INFO":
            data = dump.info_data
            response = response_dto.init_info_response(data)
        case "COMPARE":
            data = dump.compare_data
            response = response_dto.init_compare_response(data)
        case "RECOMMEND":
            data = dump.recommend_data
            response = response_dto.init_recommend_response(data)
        case default:
            data = get_output(user_input='RF85C90D1AP와 RF85C90D2AP의 차이점이 뭐야?', search=False)
            match data["type"]:
                case "INFO":
                    response = response_dto.init_info_response(data)
                case "COMPARE":
                    response = response_dto.init_compare_response(data)
                case "RECOMMEND":
                    response = response_dto.init_recommend_response(data)
                case default:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=[
                        {
                            "type": "error",
                            "msg": "Content error",
                            "input": {
                                "content": "string"
                            }
                        }
                    ])

    print(response)
    return response


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def post_feedback(
        feedback_request_dto: request_dto.FeedbackRequestDto
):
    """
    채팅에 대한 피드백 등록 API\n
    입력: FeedbackRequestDto(uuid,createdAt,content)\n
    응답: HttpResponseDto(data, success)\n
    """

    print(feedback_request_dto)
    return {"success": True}