import logging

logging.basicConfig(
    filename="error.log",
    format="%(asctime)s :: %(levelname)s :: %(funcName)s :: %(lineno)d \
:: %(message)s",
    level=logging.INFO,
)
