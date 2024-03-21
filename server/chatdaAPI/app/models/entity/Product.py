from typing import Optional

from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from chatdaAPI.app.models.utils.database import Base


class 냉장고(Base):
    __tablename__ = '냉장고'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    제품_코드: Mapped[str] = mapped_column(String(20))
    제품명: Mapped[str] = mapped_column(String(255))
    가격: Mapped[Optional[str]] = mapped_column(String(30))
    가로: Mapped[Optional[str]] = mapped_column(String(20))
    높이: Mapped[Optional[str]] = mapped_column(String(20))
    깊이: Mapped[Optional[str]] = mapped_column(String(20))
    제품_타입: Mapped[Optional[str]] = mapped_column(String(255))
    무게: Mapped[Optional[str]] = mapped_column(String(20))
    전체_용량: Mapped[Optional[str]] = mapped_column(String(20))
    냉장실_용량: Mapped[Optional[str]] = mapped_column(String(20))
    냉동실_용량: Mapped[Optional[str]] = mapped_column(String(20))
    맞춤보관실_용량: Mapped[Optional[str]] = mapped_column(String(20))
    소비효율등급: Mapped[Optional[str]] = mapped_column(String(10))
    소비_전력: Mapped[Optional[str]] = mapped_column(String(20))


class 냉장고_추가정보(Base):
    __tablename__ = '냉장고_추가정보'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    제품_코드: Mapped[str] = mapped_column(String(20))
    detail_url: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(Text)
    raw: Mapped[str] = mapped_column(Text)
