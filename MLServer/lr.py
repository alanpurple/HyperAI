import pandas as pd
from sqlalchemy import Table, MetaData
from sqlalchemy.orm import load_only
from sklearn.linear_model import ElasticNetCV

from lr_pb2 import LrResponse
from lr_pb2_grpc import LrServicer
from connectdb import getAll
from connectdb_open import getAll as getAllOpen

from sklearn.linear_model import ElasticNetCV as elanetcv

class LrService(LrServicer):
    def Elasticnetcv(self, request, context):
        if request.tableName=='' or request.sourceColumn=='' or request.targetColumn=='':
            return LrResponse(error=0)
        numOfFolds=5
        if request.numOfFolds>0:
            numOfFolds=request.numOfFolds
        engine, session, Base = getAllOpen() if request.isOpen else getAll()
        meta=MetaData()
        data=Table(request.location, meta, autoload_with=engine)
        q=session.query(data).options(load_only(request.sourceColumn,request.targetColumn))
        session.close()
        df=pd.read_sql(q.statement,engine)
        x=df.loc[:,request.sourceColumn]
        y=df.loc[:,request.targetColumn]
        regr=ElasticNetCV(cv=numOfFolds)
        xarr=x.values.reshape((len(x),1))
        regr.fit(xarr,y)
        return LrResponse(error=-1,alpha=regr.alpha_,slope=regr.coef_[0],intercept=regr.intercept_)