

import sys
import os

from flask import Flask
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from dl.routes import main as flask_main

@pytest.fixture(scope="module")
def client():
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    app.register_blueprint(flask_main)
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'testuser'
        yield client

@pytest.mark.parametrize("route", [
    '/', '/login', '/test', '/index', '/users', '/usersVue', '/logs', '/logsVue', '/fields', '/fieldsVue',
    '/dataModels', '/dataModelsVue', '/fieldsForDataModelsVue', '/datasets', '/datasetsVue', '/datamodelsForDatasetsVue',
    '/datasetGAResolutions', '/getsclistingsId_ga', '/datasetSecurityCounsel', '/getsclistingsId', '/logout'
])
def test_get_routes(client, route):
    response = client.get(route)
    assert response.status_code in [200, 302, 400, 404]

@pytest.mark.parametrize("route,method", [
    ('/usersVue/UpdateUser/123456789012345678901234', 'put'),
    ('/fieldsVue/UpdateField/123456789012345678901234', 'put'),
    ('/dataModelsVue/updateDataModel/123456789012345678901234', 'put'),
    ('/dataset/extract/123456789012345678901234/2', 'get'),
    ('/displayDatasetSecurityCounsel/2020', 'get'),
    ('/getsclistings/meeting1', 'get'),
    ('/exportjson/meeting1', 'get'),
    ('/render_meeting_ga/meeting1/EN', 'get'),
    ('/exportjsonga/meeting1', 'get'),
    ('/render_meeting_json_ga/meeting1/json/EN', 'get'),
    ('/render_meeting/meeting1/EN', 'get'),
    ('/render_meeting/meeting1/json/EN', 'get'),
])
def test_param_routes(client, route, method):
    if method == 'get':
        response = client.get(route)
    elif method == 'put':
        response = client.put(route)
    assert response.status_code in [200, 302, 400, 404]

@pytest.mark.parametrize("route", [
    '/usersVue/AddUser', '/usersVue/DeleteUser', '/fieldsVue/DeleteField', '/fieldsVue/AddField',
    '/dataModelsVue/addDataModel', '/dataModelsVue/deleteDataModel', '/datasetsVue/addDataset',
    '/datasetsVue/executeDataset/123456789012345678901234', '/datasetVue/deleteDataset', '/refresh_data', '/refresh_data_ga',
    '/create_sc_listing', '/delete_sc_listing',
])
def test_post_routes(client, route):
    response = client.post(route)
    assert response.status_code in [200, 302, 400, 404]

@pytest.mark.parametrize("route", [
    '/usersVue/UpdateUser/123456789012345678901234', '/fieldsVue/UpdateField/123456789012345678901234',
    '/dataModelsVue/updateDataModel/123456789012345678901234', '/update_sc_listing',
])
def test_put_routes(client, route):
    response = client.put(route)
    assert response.status_code in [200, 302, 400, 404]
