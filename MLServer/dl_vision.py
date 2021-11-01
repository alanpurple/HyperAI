import dl_vision_pb2
import dl_vision_pb2_grpc
from ...MaskRCNN.create_coco_tf_record import coco_preprocess
from ...MaskRCNN.mrcnn_tf2.runtime.run import run_training

class DlVisionPreprocess(dl_vision_pb2_grpc.PreprocessServicer):
    def Normalize(self, request, context):
        return super().Normalize(request, context)

    def Resize(self, request, context):
        return super().Resize(request, context)

    def SegPreprocess(self, request, context):
        locType=request.locationType
        if locType!='local' and locType!='smb':
            return dl_vision_pb2.PrepReply(error=0,msgs=['currently only local and smb type is supported for location type.'])
        if request.location=='':
            return dl_vision_pb2.PrepReply(error=0,msgs=['location not found'])
        loc=request.location
        if locType=='local':
            train_data=loc + '/' +request.train_dir
            val_data=loc + '/' + request.val_dir
            test_data=loc + '/' + request.test_dir
        elif locType=='smb':
            train_data='smb://'+loc+'/'+request.train_dir
            val_Data='smb://'+loc + '/' + request.val_dir
            test_data='smb://'+loc + '/' + request.test_dir
        train_params={
            'train_data':train_data,
            'val_data':val_data,
            'test_data':test_data
        }

class ObjectSegmentation(dl_vision_pb2_grpc.ObjectSegmentationServicer):
    def RCNNTrain(self, request, context):
        return super().RCNN(request, context)