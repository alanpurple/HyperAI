import numpy as np
from sqlalchemy import Column,Integer,Float
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sklearn.datasets import make_blobs

from connectdb_open import getAll

numOfFeatures=30

engine,_,_=getAll()

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()

class Cluster1Sample(Base):
    __tablename__='cluster1samples'

    id=Column(Integer,primary_key=True)
    f1=Column(Float)
    f2=Column(Float)
    f3=Column(Float)
    groupIndex=Column(Integer)

class Cluster1woySample(Base):
    __tablename__='cluster1woysamples'

    id=Column(Integer,primary_key=True)
    f1=Column(Float)
    f2=Column(Float)
    f3=Column(Float)

X,y=make_blobs(n_samples=1500,cluster_std=[0.8,1.0,1.5,2.5,0.7],n_features=3,centers=5,random_state=300)

X=[np.append(elem,y[idx]) for idx,elem in enumerate(X)]
X=np.array(X)
X_filtered = np.vstack((X[y == 0][:1200], X[y == 1][:700], X[y == 2][:480],X[y==3][:990],X[y==4]))

print(X_filtered)

bulk=[]
bulkwoy=[]
for elem in X_filtered:
    temp=Cluster1Sample()
    temp.f1=float(elem[0])
    temp.f2=float(elem[1])
    temp.f3=float(elem[2])
    bulkwoy.append(temp)
    temp.groupIndex=int(elem[3])
    bulk.append(temp)

Base.metadata.create_all(engine)
q=session.query(Cluster1Sample).limit(10)
if len(q.all()) == 0:
    session.bulk_save_objects(bulk)
    session.commit()

q=session.query(Cluster1woySample).limit(10)
if len(q.all())==0:
    session.bulk_save_objects(bulkwoy)
    session.commit()