from fastapi import APIRouter, Query, status
from fastapi.params import Depends
from sqlalchemy.orm import Session

from chatdaAPI.app.models.dao.detail_dao import get_product_all_detail_using_model
from chatdaAPI.app.models.utils.database import get_db
from chatdaAPI.app.models.dto.detail.DetailResponseDto import DetailResponseDto

# prefix == detail
router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK,
            response_model=DetailResponseDto)
def get_spec(
        model_no: str = Query(..., alias="modelNo"),
        db: Session = Depends(get_db)
):
    """
    모델에 대한 상세 스펙 정보 요청 API\n
    입력: path variable - ModelNo\n
    응답: DetailResponseDto(raw는 제품별로 상이) \n
    """
    return get_product_all_detail_using_model(db, model_no)
