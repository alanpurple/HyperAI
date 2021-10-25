from sklearn.datasets import make_blobs
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column,Float,Integer
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import Table

from connectdb_open import getAll

engine,_,_=getAll()

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()
col = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t']

class blobdata(Base):
    __table__=Table('blobdatas',Base.metadata,
                  Column('id',Integer,primary_key=True),
                  Column('label', Integer),
                  *[Column('{}'.format(i),Float) for i in col])

X, y = make_blobs(n_samples= 1000, cluster_std=2, centers=3, n_features=20, random_state=0)

a_new =[]

for id, arr in enumerate(X):        
    obj = blobdata(label=int(y[id]))
    for idx, elem in enumerate(arr):         
        setattr(obj,'{}'.format(col[idx]),float(elem))        
    a_new.append(obj)

blobdata.metadata.create_all(engine)
q=session.query(blobdata)
if len(q.all()) == 0:
    session.bulk_save_objects(a_new)
    session.commit()