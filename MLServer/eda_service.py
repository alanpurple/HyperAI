from sklearn.decomposition import PCA
import numpy as np
import pandas as pd

import eda_pb2
import eda_pb2_grpc

class EdaService(eda_pb2_grpc.PreprocessServicer):
    def Cleanse(self, request, context):
        return super().Cleanse(request, context)

    def Describe(self, request, context):
        return super().Describe(request, context)