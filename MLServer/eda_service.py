from sklearn.decomposition import PCA
import numpy as np
import pandas as pd

from connectdb import getAll

import eda_pb2
import eda_pb2_grpc

class EdaService(eda_pb2_grpc.PreprocessServicer):
    def Cleanse(self, request, context):
        if request.location =='':
            return eda_pb2.CleanseReply(error=0)
        conn, session, Base = getAll()
        data=Base.classes[request.location]
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,conn)
        for label,content in df.items():
            if pd.api.types.is_strng_dtype(content):
                hasnoemptystr=(content.str.len()<1).all()
                if content[content.str.len()>0].str.isnumeric.all() and content.unique().size>content.size*0.01:
                    new_content=pd.to_numeric(content)
                    if not hasnoemptystr:
                        new_content.fillna(inplace=True)
                else:
                    if not hasnoemptystr:
                        if content[content.str.len()<1].size>0.001*content.size:
                            content.replace('','unknown')
                        else:
                            content.replace('',content.mode()[0])
            else:
                content.fillna(inplace=True)


    def Describe(self, request, context):
        if request.location =='':
            return eda_pb2.CleanseReply(error=0)
        conn, session, Base = getAll()
        data=Base.classes[request.location]
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,conn)
        obj=df.describe(include='all').to_dict()
        del obj['id']
        result=[]
        for key,data in obj.items():
            temp={'name':key, 'count':int(data['count'])}
            currentData=df.loc[:,key]

            # normal categorical attribute
            if 'unique' in data and not numpy.isnan(data['unique']):
                temp['type']='categorical'
                temp['unique']=int(data['unique'])
                if not isinstance(data['top'],float):
                    if isinstance(data['top'],datetime.date):
                        temp['top']= data['top'].strftime('%Y-%m-%d %H:%M')
                        temp['type']='datetime'
                    else:
                        temp['top']=data['top']
                if not numpy.isnan(data['freq']):
                    temp['freq']=int(data['freq'])
            # numerical, but needs to be categorical
            elif len(numpy.unique(currentData))<20:
                temp['type']='categorical'
                x,y=numpy.unique(currentData,return_counts=True)
                temp['unique']=len(x)
                temp['freq']=max(y)
                temp['top']=str(x[numpy.argmax(y)])
            # normal numerical
            else:
                temp['type']='numeric'
                temp['q1']=data['25%']
                temp['q2']=data['50%']
                temp['q3']=data['75%']
                temp['mean']=data['mean']
                temp['min']=data['min']
                temp['max']=data['max']
                temp['std']=data['std']
            result.append(temp)
            return eda_pb2.SummaryReply(summaries=result)