import numpy as np
import pandas as pd
from pandas.api.types import is_string_dtype
from datetime import date

from connectdb import getAll
from connectdb_open import getAll as getAllOpen

import eda_pb2
import eda_pb2_grpc

class EdaService(eda_pb2_grpc.PreprocessServicer):
    def Cleanse(self, request, context):
        # location is just a table name (for now)
        if request.location =='':
            return eda_pb2.ProcessedReply(error=0)
        conn, session, Base = getAllOpen() if request.isOpen else getAll()
        data=Base.classes[request.location]
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,conn)
        is_cleansed=False
        for label,content in df.items():
            if is_string_dtype(content):
                hasnoemptystr=(content.str.len()>0).all()
                # convert to numeric
                if content[content.str.len()>0].str.isnumeric.all() and content.unique().size>content.size*0.01:
                    new_content=pd.to_numeric(content)
                    if not hasnoemptystr:
                        new_content.fillna(new_content.mean(),inplace=True)
                    content=new_content
                    is_cleansed=True
                # categorical+string, empty strings
                elif not hasnoemptystr:
                    # too many empty strings
                    if content[content.str.len()<1].size>0.001*content.size:
                        content.replace('','unknown')
                    else:
                        content.replace('',str(content.mode(True)[0]))
                    is_cleansed=True
            # numerical
            else:
                hasnona=content.notna().all()
                if content.unique().size<content.size*0.01:
                    if not hasnona:
                        content.fillna(content.mode(True)[0],inplace=True)
                    #convert to string
                    content.apply(str)
                    is_cleansed=True
                elif not hasnona:
                    content.fillna(content.mean(),inplace=True)
                    is_cleansed=True

        if is_cleansed:
            new_tablename=request.location+'_clsd'
            df.to_sql(new_tablename,conn)


    def Describe(self, request, context):
        if request.location =='':
            return eda_pb2.ProcessedReply
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
            currentData=df[:,key]

            # normal categorical attribute
            if 'unique' in data and not np.isnan(data['unique']):
                temp['type']='categorical'
                temp['unique']=int(data['unique'])
                if not isinstance(data['top'],float):
                    if isinstance(data['top'],date):
                        temp['top']= data['top'].strftime('%Y-%m-%d %H:%M')
                        temp['type']='datetime'
                    else:
                        temp['top']=data['top']
                if not np.isnan(data['freq']):
                    temp['freq']=int(data['freq'])
            # numerical, but needs to be categorical
            elif len(np.unique(currentData))<20:
                temp['type']='categorical'
                x,y=np.unique(currentData,return_counts=True)
                temp['unique']=len(x)
                temp['freq']=max(y)
                temp['top']=str(x[np.argmax(y)])
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

    def NormLog(self, request, context):
        return super().NormLog(request, context)