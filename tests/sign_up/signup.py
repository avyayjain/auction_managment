import time
from unittest import TestCase
from src.common.utils.constants import DB_CONNECTION_LINK
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from main import app
from starlette.testclient import TestClient
import pytest


class GetTesXLXS(TestCase):

    def setUp(self):
        app.testing = True
        engine = create_engine(DB_CONNECTION_LINK)
        self.app = TestClient(app)
        Session = sessionmaker(engine)
        self.session = Session()

    def tearDown(self):
        self.session.close()

    def test_get_request_xlxs(self):
        token_response = self.app.post(
            f"/api/v1/token",
            json={
                "email": "avyay3@gmail.com",
                "password": "avyay",
                "name": "avyay",
                "user_type": "user"
            }
        )
        expected_code = 200

        self.assertEqual(token_response.status_code,
                         expected_code,
                         "Status Code didn't match..Received {}, expected {}.".format(
                             token_response.status_code, expected_code
                         ))

        token_response_data = token_response.json()

        response = self.app.post(
            f"/api/user/sign-up/",
            json={
                "email": "avyay3@gmail.com",
                "password": "avyay",
                "name": "avyay",
                "user_type": "user"
            }
        )

        self.assertEqual(
            response.status_code,
            expected_code,
            "Status Code didn't match..Received {}, expected {}.".format(
                response.status_code, expected_code
            ),
        )

