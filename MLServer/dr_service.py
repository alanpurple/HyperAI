from sklearn.decomposition import PCA
import pandas as pd

from connectdb import getAll

import dr_pb2
import dr_pb2_grpc

class PcaService(dr_pb2_grpc.PcaServicer):
    def Pca(self, request, context):
        return super().Pca(request, context)

    def PcaRsvd(self, request, context):
        return super().PcaRsvd(request, context)

class LdaService(dr_pb2_grpc.LdaServicer):
    def LdaEigen(self, request, context):
        return super().LdaEigen(request, context)
    def LdaSvd(self, request, context):
        return super().LdaSvd(request, context)