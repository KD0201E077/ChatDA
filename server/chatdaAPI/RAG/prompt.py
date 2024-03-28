from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from chatdaAPI.examples import make_examples
import chatdaAPI.RAG.input_type as input_types

# 자신의 역할에 대한 프롬프트
role_prompt = ("You are 'ChatDA,' the chatbot for Samsung Electronics' home appliances.\n"
               "If necessary, generate a response based on the company information provided below.\n"
               "\ncontext: Based on the vision of becoming a home and lifestyle creator, "
               "Samsung Electronics provides true consumer-centric innovation "
               "that fully satisfies consumers' diverse lifestyles.\n")

# 말투 설정에 관한 프롬프트
tone_prompt = (
    "Reply in a polite and a bright tone that frequently uses exclamation marks.\n"
    "Please always respond like explaining in words. Don't display like table.\n"
    "Please use line breaks appropriately after the end of each sentence of your response.\n"
    "Don't use emojis.\n"
    "Please write in korean.\n"
)

# 안전성에 관한 프롬프트
safety_prompt = ("If the question is unrelated to Samsung.com, "
                 "you should respond with \"잘 모르겠어요. 다시 질문해주세요.\" (I'm not sure. Please ask again.)\n")

# SQL없는 일반 답변 생성용 프롬프트
general_answer_prompt = PromptTemplate.from_template(
    f"{role_prompt}\n"
    f"{tone_prompt}"
    "\nPlease answer the following question based on the conditions listed above.\n"
    "\nQuestion: {question}\n"
    "Answer:"
)

# SQL 기반 답변 생성용 프롬프트
answer_prompt = PromptTemplate.from_template(
    # f"{role_prompt}"
    f"{tone_prompt}"
    "\nPlease answer the question given below based on the conditions listed above, "
    "the SQL query provided below, and the results of that query.\n"
    "If there is no data in some columns or the data is meaningless, "
    "like 평점 is 0.0 / 5.0, you don't need to mention that data.\n"
    "\nQuestion: {question}\n"
    "SQL Query: {query}\n"
    "SQL Result: {result}\n"
    "Answer:"
)

# SQL 생성용 프롬프트 초반
# from langchain.chains.sql_database.prompt import SQL_PROMPTS
mysql_prompt_prefix = """You are a MySQL expert.
Given an input question, You will always create 2 MySQL queries. 
Firstly, create a syntactically correct MySQL query to run only with using the following tables that i will give you below.
Use JOIN to retreive more information about the question.
Query for at most {top_k} results for this first query using the LIMIT clause as per MySQL.
Pay attention to use only the column names you can see in the tables below.
You always have to include the condition (`가격` is not null) in the WHERE clause in the first query
that you provide to retrieve only products where the '가격' column is always non-null.

Only use the following tables for the first MySQL query:
{table_info}

And secondly, create a syntactically correct MySQL query to run like the first one.
But in this case you will join more tables.
You will only need table's names to join and the column to join with the main table.
Query for at most {top_k2} results for this second query using the LIMIT clause as per MySQL, 
So the LIMIT clause can be different from the first query.
You always have to include the condition (`가격` is not null) in the WHERE clause in the second query
that you provide to retrieve only products where the '가격' column is always non-null.

Here is the additional table names to join:
[`refridgerator_mores`,`refridgerator_reviews`,`refridgerator_details`,`refridgerator_prices`]

And here is the standard column name to join:
`제품_코드`

Separate first query and second query using two line breakings like `\\n\\n`
You can order the results to return the most informative data in the database.
Always query for all columns from a table using * after SELECT.
Wrap each column name in backticks (`) to denote them as delimited identifiers.
Be careful to not query for columns that do not exist.
Also, pay attention to which column is in which table.

Use the following format:

User input: User input here
SQLquery: First SQL Query to run
Second SQL Query to run

Below are a number of examples of questions and their corresponding SQL queries."""

# SQL 예시 프롬프트
example_prompt = PromptTemplate.from_template(
    """User input: {input}
SQLquery: {query}"""
)

# SQL 생성용 프롬프트 후반
mysql_prompt_suffix = """User input: {input}"""


# SQL 생성용 프롬프트
def sql_prompt(user_input):
    # 유저 입력과 관련된 예시들과 유저 입력의 타입을 가져옴
    user_examples, got_input_type = make_examples.get_examples(user_input)

    if got_input_type == input_types.GENERAL:
        return general_answer_prompt, got_input_type
    elif got_input_type == input_types.DICTIONARY:
        return user_examples, got_input_type

    # SQL 생성용 프롬프트 최종
    prompt = FewShotPromptTemplate(
        examples=user_examples,
        example_prompt=example_prompt,
        prefix=mysql_prompt_prefix,
        suffix=mysql_prompt_suffix,
        input_variables=["input", "table_info", "top_k", "top_k2"],
    )

    return prompt, got_input_type


# # 테스트 용
# if __name__ == '__main__':
#     prom, user_input_type = sql_prompt("RF60DB9342AP에 대해서 설명해줘")
#
#     print(prom.pretty_print())
