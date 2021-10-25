import eda_vision_pb2
import eda_vision_pb2_grpc

class EdaVisionService(eda_vision_pb2_grpc.PreprocessServicer):
    def Normalize(self, request, context):
        return super().Normalize(request, context)

    def Resize(self, request, context):
        return super().Resize(request, context)