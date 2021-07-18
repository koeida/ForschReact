FROM python:3.9
WORKDIR /usr/src/app
COPY . .
RUN pip install -r requirements.txt

CMD [ "python3", "-m", "flask", "run", "-h", "0.0.0.0", "--port", "9876"]
