import pandas as pd
import numpy as np
from re import sub

import data_service_pb2
import data_service_pb2_grpc

from connectdb import getAll

class DataServicer(data_service_pb2_grpc.DataServicer):
    def Upload(self, request, context):
        if '.' not in request.name:
            return data_service_pb2.UploadResponse(error=0)
        filename=request.name
        # header should be on the first row
        path='../WebServer/upload-temp'
        ext=filename.split('.')[-1]
        tablename=sub('[-_]','', filename.split('.')[0])
        if len(ext)<1 or len(tablename)<1:
            return data_service_pb2.UploadResponse(errpr=0)
        conn, session, Base = getAll()

        # only csv,tsv and xlsx are available for now
        if ext=='csv':
            df=pd.read_csv(path+filename,index_col=0)
        elif ext='tsv':
            df=pd.read_csv(path+filename,'\t',index_col=0)
        elif ext=='xlsx':
            df=pd.read_excel(path+filename,index_col=0)
        else:
            return data_service_pb2.UploadResponse(error=0)
        
        df.to_sql(tablename,conn)

        return data_service_pb2.UploadResponse(error=-1)