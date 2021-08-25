import numpy as np
from sqlalchemy import Column,Integer,Float
from sqlalchemy.schema import Table
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from urllib import parse
from sklearn.datasets import make_moons,make_circles

from connectdb_open import getAll

engine,_,_=getAll()

numOfSamples=1500

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()

class Moon1Sample(Base):
    __tablename__='moon1samples'

    id=Column(Integer,primary_key=True)
    f1=Column(Float)
    f2=Column(Float)
    groupIndex=Column(Integer)

class Circle1Sample(Base):
    __tablename__='circle1samples'

    id=Column(Integer,primary_key=True)
    f1=Column(Float)
    f2=Column(Float)
    groupIndex=Column(Integer)

xm,ym=make_moons(n_samples=numOfSamples,noise=.07,random_state=300)

moonBulk=[]
for idx,elem in enumerate(xm):
    temp=Moon1Sample()
    temp.f1=float(elem[0])
    temp.f2=float(elem[1])
    temp.groupIndex=int(ym[idx])
    moonBulk.append(temp)

xc,yc=make_circles(n_samples=numOfSamples,noise=.07,random_state=300,factor=0.82)

circleBulk=[]
for idx,elem in enumerate(xc):
    temp=Circle1Sample()
    temp.f1=float(elem[0])
    temp.f2=float(elem[1])
    temp.groupIndex=int(yc[idx])
    circleBulk.append(temp)

Base.metadata.create_all(engine)
q=session.query(Moon1Sample).limit(10)
if len(q.all()) == 0:
    session.bulk_save_objects(moonBulk)
    session.commit()

q=session.query(Circle1Sample).limit(10)
if len(q.all()) == 0:
    session.bulk_save_objects(circleBulk)
    session.commit()
