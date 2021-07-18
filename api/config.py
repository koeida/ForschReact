FORSCH_URL='http://forsch-service:9000/ForschService.asmx?wsdl'

f = open("initial_environment.json", "r")
DEFAULT_ENV = f.read()
f.close()

