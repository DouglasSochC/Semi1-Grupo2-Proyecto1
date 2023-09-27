from dotenv import dotenv_values
import os

print(dotenv_values())

print(dotenv_values()['DB_HOST'])