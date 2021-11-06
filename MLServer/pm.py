import threading
import os
from pm_pb2 import PmStat,PmResponse,TbResponse
import pm_pb2_grpc


class PmService(pm_pb2_grpc.pmServicer):
    def GetPmStatus(self, request, context):
        if len(request.processes)<1:
            return PmResponse(error=0)
        result=[]
        allthreads=[thread.name for thread in threading.enumerate()]
        for name in request.processes:
            status=name in allthreads
            result.append(PmStat(name=name,status=status))
        return PmResponse(error=-1,stats=result)

    def TerminateTb(self, request, context):
        if request.taskname=='':
            return TbResponse(error=0)
        tb_thread=((thread for thread in threading.enumerate()
                    if thread.name==request.taskname+'_tb'),None)
        if tb_thread is None:
            return TbResponse(error=0)
        os.system('kill '+str(tb_thread.ident))
        return TbResponse(error=-1)