import eda_text_pb2
import eda_text_pb2_grpc

class EdaTextService(eda_text_pb2_grpc.PreprocessServicer):
    def MakeEmbedding(self, request, context):
        return super().MakeEmbedding(request, context)
