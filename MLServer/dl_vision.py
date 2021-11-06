import threading
import os
import dl_vision_pb2
import dl_vision_pb2_grpc
from MaskRCNN.create_coco_tf_record import coco_preprocess
from MaskRCNN.mrcnn_tf2.runtime.run import run_training

class DlVisionPreprocess(dl_vision_pb2_grpc.PreprocessServicer):
    def Normalize(self, request, context):
        return super().Normalize(request, context)

    def Resize(self, request, context):
        return super().Resize(request, context)

    def SegPreprocess(self, request, context):
        if request.name=='':
            return dl_vision_pb2.PrepReply(error=0,msgs=['task name not found'])
        locType=request.locationType
        if locType!='local' and locType!='smb':
            return dl_vision_pb2.PrepReply(error=0,msgs=['currently only local and smb type is supported for location type.'])
        if request.location=='':
            return dl_vision_pb2.PrepReply(error=0,msgs=['location not found'])
        loc=request.location
        if locType=='local':
            loc_prefix=loc+'/'
        elif locType=='smb':
            loc_prefix='smb://'+loc+'/'
        else:
            return dl_vision_pb2.PrepReply(error=0,msgs=['unsupported location type'])

        train_data= loc_prefix + request.train_dir
        val_data= loc_prefix + request.val_dir
        test_data= loc_prefix + request.test_dir
        object_file = loc_prefix + request.train_anno
        caption_file= loc_prefix + request.train_cap_anno
        prep_params={
            'train_data':train_data,
            'val_data':val_data,
            'test_data':test_data
        }
        threading.Thread(
            target=coco_preprocess(
                object_file,caption_file,train_data,request.include_mask),
            name=request.name
            ).start()
        return dl_vision_pb2.PrepReply(error=-1,msgs=['coco data preprocessing started'])


class ObjectSegmentation(dl_vision_pb2_grpc.ObjectSegmentationServicer):
    def RCNNTrain(self, request, context):
        if request.name=='':
            return dl_vision_pb2.TrainReply(error=0,msgs=['task name not found'])
        locType=request.locationType
        if locType!='local' and locType!='smb':
            return dl_vision_pb2.PrepReply(error=0,msgs=['currently only local and smb type is supported for location type.'])
        if request.location=='':
            return dl_vision_pb2.PrepReply(error=0,msgs=['location not found'])
        loc=request.location
        if locType=='local':
            loc_prefix=loc+'/'
        elif locType=='smb':
            loc_prefix='smb://'+loc+'/'
        else:
            return dl_vision_pb2.PrepReply(error=0,msgs=['unsupported location type'])

        params=request.model_params

        if params.min_level<1:
            params.min_level=2
        if params.max_level<1:
            params.max_level=6
        if params.num_scales<1:
            params.num_scales=1

        tbrun_str='tensorboard --bind_all'
        if request.tb_port>0:
            # optional tensorboard port, defaults to 6006 if none
            tbrun_str+=' --port '+str(request.tb_port)
        def run_tb():
            os.system(tbrun_str+' --logdir tblogs/'+request.name)

        threading.Thread(target=run_training(),name=request.name).start()
        threading.Thread(target=run_tb(),name=request.name+'_tb').start()

        return dl_vision_pb2.TrainReply(error=-1,msgs=['train started'])