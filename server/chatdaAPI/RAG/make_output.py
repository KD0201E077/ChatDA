import mysql.connector
from langchain.chains import create_sql_query_chain
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_core.globals import set_debug
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

import chatdaAPI.RAG.input_type as input_types
import chatdaAPI.RAG.prompt as prompt
from chatdaAPI.config import config

import chatdaAPI.examples.examples_ranking as examples_ranking

# DB 불러오기
db = SQLDatabase.from_uri(
    f'mysql+pymysql://{config.mysql_user}:{config.mysql_password}'
    f'@{config.mysql_host}:{config.mysql_port}/{config.mysql_database}',
    sample_rows_in_table_info=1,
    include_tables=["refridgerators", "refridgerator_reviews", "refridgerator_details"],
    max_string_length=1000
)

# DB 테이블 정보
context = db.get_context()

# 언어 모델 로드
llm = ChatOpenAI(model="gpt-3.5-turbo-16k", temperature=0.1, verbose=True)

# 언어 모델 로드 with Stream
llm_stream = ChatOpenAI(model="gpt-3.5-turbo-16k", temperature=0.1, verbose=True, streaming=True,)

# 데이터베이스 연결 설정
setup = {
    'user': config.mysql_user,  # 데이터베이스 사용자 이름
    'password': config.mysql_password,  # 데이터베이스 비밀번호
    'host': config.mysql_host,  # 데이터베이스 호스트
    'database': config.mysql_database,  # 데이터베이스 이름
    'raise_on_warnings': True
}
# 데이터베이스에 연결
conn = mysql.connector.connect(**setup)
# 커서 생성 - 딕셔너리 형태로 결과를 가져오기 위해 dictionary=True 옵션 사용
cursor = conn.cursor(dictionary=True)


# join문까지 포함된 sql을 이용하여 모든 정보를 가져와서 list를 만드는 함수
def make_model_list(query):
    # SQL 쿼리 실행
    cursor.execute(query)
    # 모든 결과를 딕셔너리 리스트로 가져옴
    results = cursor.fetchall()
    # # 연결 종료
    # cursor.close()
    # conn.close()

    return results


# 사용자의 입력으로부터 출력을 생성하는 함수
def get_output(user_input, search):
    # 사용자 입력으로부터 SQL 프롬프트와 제품을 리스트 형태로 보여줘야 하는지의 여부를 가져옴
    first_prompt, user_input_type = prompt.sql_prompt(user_input)
    model_list = []

    # 용어에 대한 질문일 경우
    if user_input_type == input_types.DICTIONARY:
        result = first_prompt["query"]
    # SQL문이 필요한 대화인 경우
    elif user_input_type != input_types.GENERAL:
        # 랭킹인 경우 정해진 답변을 생성하여 리턴
        if user_input_type == input_types.RANKING:
            ranking_query = examples_ranking.examples[0]["query"].split("\n\n")[1]

            model_list = make_model_list(ranking_query)
            model_list = model_list[:3]
            ranking_list = ""

            # 3위까지 답변 생성
            for i in range(3):
                ranking_list += f"{i+1}위는 {model_list[i]['제품_코드']}\n"

            return {
                "type": user_input_type,
                "content": "ChatDA가 가장 인기가 많은 냉장고 순위를 알려드릴게요!\n\n"
                           f"{ranking_list}\n"
                           "그 이외의 순위는 옆에서 확인해주세요!",
                "model_list": model_list
            }

        # SQL 생성을 위한 chain
        create_sql = create_sql_query_chain(llm, db, first_prompt)

        # LLM 입력용 최대 행 개수
        max_rows = 5
        # 리스트용 최대 행 개수
        max_rows2 = 10

        # SQL query 생성
        query = create_sql.invoke(
            {
                "question": user_input,
                "top_k": max_rows,
                "top_k2": max_rows2,
                "table_info": context["table_info"]
            }
        ).split("\n\n")

        # model list 생성
        model_list = make_model_list(query[1])

        # 검색 기능인 경우 model list만 생성후 리턴
        if search:
            return {
                "type": input_types.SEARCH,
                "content": "",
                "model_no_list": model_list
            }
        # 추천인 경우 정해진 답변과 제품 목록만 리턴
        elif user_input_type == input_types.RECOMMEND:
            return {
                "type": user_input_type,
                "content": "이 상품은 어떠세요?",
                "model_no_list": model_list
            }

        # 최대 행 개수 설정
        db._sample_rows_in_table_info = max_rows

        # SQL query 실행
        result = db.run(query[0], include_columns=True)

        if result and len(result) > 0:
            # 얻은 결과로 답변 생성하는 체인 구성
            # answer_chain = prompt.answer_prompt | llm_stream | StrOutputParser()
            answer_chain = prompt.answer_prompt | llm | StrOutputParser()

            # 유저 입력으로부터 답변 생성
            # result = answer_chain.stream({"question": user_input, "query": query[0], "result": result})
            result = answer_chain.stream({"question": user_input, "query": query[0], "result": result})

        else:
            result = "제품에 대한 정보가 존재하지 않습니다!"
            model_list = None
    # 일반적인 대화인 경우
    else:
        answer_chain = first_prompt | llm_stream | StrOutputParser()

        result = answer_chain.stream({"question": user_input})

    return {
        "type": user_input_type,
        "content": result,
        "model_list": model_list
    }


# 체인 중간 과정 보기
set_debug(True)

# 테스트용
if __name__ == '__main__':
    res = get_output(user_input='RF60DB9Z71APG 설명해줘', search=False)
    res["content"].stream()
    print(f"type : {res['type']}")
    print(f"content : {res['content']}")
