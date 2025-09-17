from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    arxiv_id = Column(String, unique=True, index=True)
    title = Column(String)
    abstract = Column(Text)
    authors = Column(String)
    publication_year = Column(Integer)
    url = Column(String)

    # New: store embedding as an array of floats
    embedding = Column(ARRAY(Float))