from time import sleep
import grpc
import asyncio
from concurrent import futures

from eda_service import EdaService
from data_service import DataServicer
from lr import LrService
from dr_service import PcaService, LdaService
from eda_text import EdaTextService
from eda_vision import EdaVisionService
from train import TrainService
from data_service_pb2_grpc import add_DataServicer_to_server
from dr_pb2_grpc import add_LdaServicer_to_server,add_PcaServicer_to_server
from lr_pb2_grpc import add_LrServicer_to_server
from eda_pb2_grpc import add_PreprocessServicer_to_server as edas
from eda_text_pb2_grpc import add_PreprocessServicer_to_server as edat
from eda_vision_pb2_grpc import add_PreprocessServicer_to_server as edav
from train_pb2_grpc import add_TrainerServicer_to_server
_ONE_DAY_IN_SECONDS = 60 * 60 * 24

server=grpc.server(futures.ThreadPoolExecutor(max_workers=10))
add_LdaServicer_to_server(LdaService(),server)
add_PcaServicer_to_server(PcaService(),server)
edas(EdaService(),server)
edat(EdaTextService(),server)
edav(EdaVisionService(),server)
add_TrainerServicer_to_server(TrainService(),server)
add_DataServicer_to_server(DataServicer(),server)
add_LrServicer_to_server(LrService(),server)

server.add_insecure_port('[::]:50051')
server.start()
try:
  while True:
    sleep(_ONE_DAY_IN_SECONDS)
except KeyboardInterrupt:
  server.stop(0)