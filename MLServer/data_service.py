import pandas as pd
import numpy as np

import data_service_pb2
import data_service_pb2_grpc

class DataServicer(data_service_pb2_grpc.DataServicer):
    def Upload(self, request, context):
        if request.name=='':
            return data_service_pb2.UploadResponse(error=1)
        filename=request.name
        # header should be on the first row
        path='../WebServer/upload-temp'
        ext=filename.split('.')[-1]
        f=open(path+filename,'r')

        if ext=='csv':
            df=pd.read_csv(f)
        elif ext=='xlsx':
            df=pd.read_excel(f)

        f.close()