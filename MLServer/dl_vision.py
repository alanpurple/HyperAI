import dl_vision_pb2
import dl_vision_pb2_grpc

class DlVisionPreprocess(dl_vision_pb2_grpc.PreprocessServicer):
    def Normalize(self, request, context):
        return super().Normalize(request, context)

    def Resize(self, request, context):
        return super().Resize(request, context)

class ObjectSegmentation(dl_vision_pb2_grpc.ObjectSegmentationServicer):
    def RCNN(self, request, context):
        return super().RCNN(request, context)