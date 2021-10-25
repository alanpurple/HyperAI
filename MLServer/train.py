import train_pb2, train_pb2_grpc

class TrainService(train_pb2_grpc.TrainerServicer):
    def StartTrain(self, request, context):
        return super().StartTrain(request, context)

    def StopTrain(self, request, context):
        return super().StopTrain(request, context)