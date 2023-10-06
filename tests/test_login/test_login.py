from unittest import TestCase
from src.common.utils.constants import DB_CONNECTION_LINK
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from main import app
from starlette.testclient import TestClient
import pytest


class TestLogin(TestCase):

    def setUp(self):
        app.testing = True
        engine = create_engine(DB_CONNECTION_LINK)
        self.app = TestClient(app)
        Session = sessionmaker(engine)
        self.session = Session()

    def tearDown(self):
        self.session.close()

    def test_login(self):
        token_response = self.app.post(
            f"/api/v1/token",
            json={
                "email_id": "avyay@gmail.com",
                "password": "avyay"
            }
        )
        expected_code = 200

        self.assertEqual(token_response.status_code,
                         expected_code,
                         f"Status Code didn't match..Received {token_response.status_code}, expected {expected_code}.")

    def test_login_8(self):
        data = {
            "detail": [
                {
                    "msg": "Incorrect Email or password",
                    "type": "PermissionDeniedError"
                }
            ]
        }
        token_response = self.app.post(
            f"/api/v1/token",
            json={
                "email_id": "avyay@gmail.com",
                "password": "avyayjain"
            }
        )
        expected_code = 401

        self.assertEqual(token_response.status_code,
                         expected_code,
                         "Status Code didn't match..Received {}, expected {}.".format(
                             token_response.status_code, expected_code
                         ))

        token_response_data = token_response.json()

        self.assertEqual(
            token_response_data["detail"],
            data["detail"],
            "Status Code didn't match..Received {}, expected {}.".format(
                token_response.status_code, expected_code
            ),
        )

