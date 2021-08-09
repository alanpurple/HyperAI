from lr_pb2 import LrRequest,LrResponse
from lr_pb2_grpc import lrServicer
from connectdb import getAll
from connectdb_open import getAll as getAllOpen

from sklearn.linear_model import ElasticNetCV as elanetcv

class LrService(lrServicer):
    def Elasticnetcv(self, request, context):
        if request.tableName=='' or request.sourceColumn=='' or request.targetColumn=='':
            return lrservice_pb2.LrResponse(error=0)
        numOfFolds=5
        if request.numOfFolds>0:
            numOfFolds=request.numOfFolds
        conn, session, Base = getAllOpen() if request.isOpen else getAll()
        data=Base.classes[request.tableName]
        q=session.query(data).options(load_only(request.sourceColumn,request.targetColumn))
        session.close()
        df=pandas.read_sql(q.statement,conn)
        x=df.loc[:,request.sourceColumn]
        y=df.loc[:,request.targetColumn]
        regr=ElasticNetCV(cv=numOfFolds)
        xarr=x.values.reshape((len(x),1))
        regr.fit(xarr,y)
        return lrservice_pb2.LrResponse(error=-1,alpha=regr.alpha_,slope=regr.coef_[0],intercept=regr.intercept_)