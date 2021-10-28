import dl_vision_pb2
import dl_vision_pb2_grpc
from ...MaskRCNN.create_coco_tf_record import create_tf_example
from ...MaskRCNN.mrcnn_tf2.runtime.run import run_training

class DlVisionPreprocess(dl_vision_pb2_grpc.PreprocessServicer):
    def Normalize(self, request, context):
        return super().Normalize(request, context)

    def Resize(self, request, context):
        return super().Resize(request, context)

class ObjectSegmentation(dl_vision_pb2_grpc.ObjectSegmentationServicer):
    def RCNNTrain(self, request, context):
        return super().RCNN(request, context)