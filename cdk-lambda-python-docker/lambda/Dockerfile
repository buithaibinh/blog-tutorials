FROM public.ecr.aws/lambda/python:3.8

# ${LAMBDA_TASK_ROOT}
WORKDIR ${LAMBDA_TASK_ROOT}

# copy all python files to lamda working directory
COPY main.py .

# Copy requirements.txt to lamda working directory
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "main.handler" ]