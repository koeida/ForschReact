from flask import Flask, render_template, request, jsonify
import config
import json

from suds.client import Client

app = Flask(__name__)

@app.route('/step', methods=['POST'])
def step():
    try:
        request_data = request.get_json(force=True)

        
        client = Client(config.FORSCH_URL)
        result = client.service.EvalStep(str(request_data).replace("False", "false"))

    except Exception as e:
        print('error: ' + str(e))
        result = "{error: Error communicating with Forsch server: " + str(e) + "}"
    return result
