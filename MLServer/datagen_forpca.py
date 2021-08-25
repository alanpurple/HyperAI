from sklearn.feature_extraction import DictVectorizer
from pandas import read_csv
from sklearn.datasets import make_low_rank_matrix
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, ForeignKey, create_engine,Float,Integer,String
from sqlalchemy.sql.sqltypes import Boolean
from sqlalchemy.orm import relationship, load_only, sessionmaker
from sqlalchemy.schema import Table

from connectdb_open import getAll

engine,_,_=getAll()

numOfFeatures=30

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()

class N1Sample(Base):
    __table__=Table('n1samples',Base.metadata,
                  Column('id',Integer,primary_key=True),
                  *[Column('v{}'.format(i),Float) for i in range(numOfFeatures)])


a=make_low_rank_matrix(500,numOfFeatures,effective_rank=13)
a_new=[]
for arr in a:
    obj=N1Sample()
    for idx,elem in enumerate(arr):
        setattr(obj,'v{}'.format(idx),float(elem*200 + 30))
    a_new.append(obj)

Base.metadata.create_all(engine)
q=session.query(N1Sample).limit(10)
if len(q.all()) == 0:
    session.bulk_save_objects(a_new)
    session.commit()