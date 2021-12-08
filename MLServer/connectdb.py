from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker
from sqlalchemy.ext.automap import automap_base
#from urllib.parse import quote_plus
import json

with open('../uri.json','r') as urifile:
    uri=json.load(urifile)


server=uri['sqlServer']
database=uri['hyperaisql']
driver = 'MySQL ODBC 8.0 Unicode Driver'
id=uri['id']
pwd=uri['password']


def getAll():
    engine=create_engine("mysql+mysqlconnector://{}:{}@{}/{}".format(id,pwd,server,database))
    #engine=create_engine('mysql+pyodbc://{}:{}@{}/{}?driver={}'.format(id,pwd,server,database,quote_plus(driver)))
    base = automap_base()
    base.prepare(engine,reflect=True)
    return engine,scoped_session(sessionmaker(engine)),base