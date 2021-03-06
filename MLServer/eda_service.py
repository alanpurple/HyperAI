import numpy as np
import pandas as pd
from pandas.api.types import is_string_dtype
from datetime import date
from sqlalchemy import Table,MetaData

from connectdb import getAll
from connectdb_open import getAll as getAllOpen

import eda_pb2
import eda_pb2_grpc

class EdaService(eda_pb2_grpc.PreprocessServicer):
    def Cleanse(self, request, context):
        # location is just a table name (for now)
        if request.location =='':
            return eda_pb2.ProcessedReply(error=0)
        engine, session, Base = getAllOpen() if request.isOpen else getAll()
        meta=MetaData()
        data=Table(request.location, meta, autoload_with=engine)
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,engine,'index')
        is_cleansed=False
        allnullcolumns=[]
        for name in df.columns:
            if df[name].isna().all():
                allnullcolumns.append(name)
        if len(allnullcolumns)>0:
            df.drop(allnullcolumns,axis=1,inplace=True)
        for label,content in df.items():
            if is_string_dtype(content):
                hasnoemptystr=(content.str.len()>0).all()
                # convert to numeric
                is_valid_content=content[content.str.len()>0]
                if(len(is_valid_content)>0):
                    is_valid_content=content[content.str.len()>0].str.isnumeric().all()
                    if(is_valid_content and content.unique()==[None]):
                        is_valid_content=False
                else:
                    is_valid_content=False
                if is_valid_content and content.unique().size>content.size*0.01:

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
                        content.fillna()
                        content.replace(None,str(content.mode(True)[0]))
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
            nRows=df.shape[0]
            new_tablename=request.location+'_clsd'
            df.to_sql(new_tablename,engine)
            return eda_pb2.ProcessedReply(error=-1,msg=['cleansed'],loc=new_tablename,numRows=nRows)
        else:
            return eda_pb2.ProcessedReply(error=-1,msg=['clean'])


    def Describe(self, request, context):
        if request.location =='':
            return eda_pb2.SummaryReply(error=0)
        engine, session, Base = getAllOpen() if request.isOpen else getAll()
        meta=MetaData()
        data=Table(request.location, meta, autoload_with=engine)
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,engine)
        obj=df.describe(include='all').to_dict()
        if 'id' in obj:
            del obj['id']
        if 'index' in obj:
            del obj['index']
        result=[]
        for key,data in obj.items():
            temp={'name':key, 'count':int(data['count'])}
            currentData=df[key]

            def _reducePrecision(value):
                valuestr=str(value)
                if 'e' in valuestr:
                    if len(valuestr)<10:
                        return valuestr
                    npart,exppart= valuestr.split('e')
                    if len(npart)>6:
                        return npart[:6]+'e'+exppart
                    else:
                        return valuestr
                elif '.' in valuestr:
                    if len(valuestr)<7:
                        return valuestr
                    bigpart,smallpart=valuestr.split('.')
                    if len(smallpart)<3:
                        return valuestr
                    else:
                        if len(bigpart)<4:
                            if len(smallpart)>4:
                                return bigpart+'.'+smallpart[:4]
                            else:
                                return valuestr
                        else:
                            return bigpart+'.'+smallpart[:2]
                return valuestr

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
                temp['q1']=_reducePrecision(data['25%'])
                temp['q2']=_reducePrecision(data['50%'])
                temp['q3']=_reducePrecision(data['75%'])
                temp['mean']=_reducePrecision(data['mean'])
                temp['min']=_reducePrecision(data['min'])
                temp['max']=_reducePrecision(data['max'])
                temp['std']=_reducePrecision(data['std'])

            result.append(temp)
        return eda_pb2.SummaryReply(error=-1,summaries=result)

    # suppose there is only one exponential base in the world ( e, Euler's number, for simplicity )
    def NormLog(self, request, context):
        if request.location =='':
            return eda_pb2.ProcessedReply(error=0)
        engine, session, Base = getAll()
        meta=MetaData()
        data=Table(request.location, meta, autoload_with=engine)
        q=session.query(data)
        session.close()
        df=pd.read_sql(q.statement,engine)
        # nothing to normalize ( numerically )
        if ((df.dtypes!='string')&(df.dtypes!='datetime')).sum()<1:
            return eda_pb2.ProcessedReply(error=-1,msg=['no numeric'])
        newdf=pd.DataFrame(df.columns)
        for label,content in df.items():
            if not is_string_dtype(content):
                is_signed= False
                # check signed type
                if np.percentile(content,25) < 0 and np.percentile(content,75)>0:
                    #signed data
                    is_signed=True
                if np.percentile(content,75)<0:
                    content=-content
                minvalue=np.percentile(content,1)
                maxvalue=np.percentile(content,99)
                filtered=content[(content>minvalue)&(content<maxvalue)]
                stddev=np.std(filtered)
                # signed data ends here
                if is_signed:
                    newdf[label]=content/stddev
                    continue
                filtered=filtered-minvalue
                mean=filtered.mean()    
                median=np.median(filtered)
                #filtered-=mean
                filtered-=minvalue
                filtered/=stddev
                if mean>median and median-minvalue < (mean-minvalue) * 0.6:
                    #log applied
                    filtered=np.log(filtered)
                elif mean<median and maxvalue-median < (maxvalue - mean) * 0.6:
                    filtered=1-filtered
                    filtered=np.log(filtered)

                newdf[label]=filtered
            else:
                newdf[label]=content
        
        newtable=request.location+'_prp'
        newdf.to_sql(newtable,engine)
        nRows=newdf.shape[0]
                
        return eda_pb2.ProcessedReply(error=-1,msg=['normalized'],loc=newtable,numRows=nRows)