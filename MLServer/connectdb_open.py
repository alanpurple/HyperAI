from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker
from sqlalchemy.ext.automap import automap_base
from urllib import parse

server='localhost'
database='opendata'
driver = 'MySQL ODBC 8.0 Unicode Driver'
id='root'
pwd='alan1234'

def getAll():
    engine=create_engine("mysql+mysqlconnector://{}:{}@{}/{}".format(id,pwd,server,database))
    #engine=create_engine('mysql+pyodbc://{}:{}@{}/{}?driver={}'.format(id,pwd,server,database,parse.quote_plus(driver)))
    base = automap_base()
    base.prepare(engine,reflect=True)
    return engine.connect(),scoped_session(sessionmaker(engine)),base