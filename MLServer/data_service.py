import pandas as pd
import numpy as np

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
        tablename=filename.split('.')[0]
        if len(ext)<1 or len(tablename)<1:
            return data_service_pb2.UploadRequest(error=0)
        f=open(path+filename,'r')
        conn, session, Base = getAll()
        if ext=='csv':
            df=pd.read_csv(f)
        elif ext=='xlsx':
            df=pd.read_excel(f)

        f.close()
        df.to_sql(tablename,conn)

        return data_service_pb2.UploadResponse(error=-1)