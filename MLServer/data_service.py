import pandas as pd
import numpy as np
from re import sub

import data_service_pb2
import data_service_pb2_grpc

from connectdb import getAll
from connectdb_open import getAll as getAllOpen

class DataServicer(data_service_pb2_grpc.DataServicer):
    def Upload(self, request, context):
        if request.name=='' or request.location=='' or request.extname=='':
            return data_service_pb2.UploadResponse(error=0)
        tablename=tablename=sub('[-_]','', request.name).lower()
        # header should be on the first row
        path='../upload-temp/'+request.location
        ext=request.extname
        conn, session, Base = getAllOpen() if request.isadmin else getAll()
        # only csv,tsv and xlsx are available for now
        if ext=='csv':
            df=pd.read_csv(path)
        elif ext=='tsv':
            df=pd.read_csv(path,'\t')
        elif ext=='xlsx':
            df=pd.read_excel(path)
        else:
            return data_service_pb2.UploadResponse(error=0)
        
        df.to_sql(tablename,conn)

        return data_service_pb2.UploadResponse(error=-1,tablename=tablename,numrows=df.shape[0])