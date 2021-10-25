To run this solution by own local machine

1. install packages in frontend(hyperai) and server(webserver) - simply type "npm install"
2. build frontend ( HyperAI or alternative(newly developed) )
3. build webserver - simply type "tsc"
4. generate every protocol buffer files we need
	- execute "python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. .\data_service.proto" for every .proto files in mlserver

5. run mlserver -  "python run_server.py" in mlserver
6. run webserver - "node app.js" in webserver

7. web server has port 3000 by default ( if none set ), so address should be "http://localhost:3000"