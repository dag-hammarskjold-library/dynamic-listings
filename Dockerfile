FROM public.ecr.aws/lambda/python:3.11

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install git and other required libs like libxml
RUN yum install -y git-all gcc python-devel libxml2-devel libxslt-devel

# Install the specified packages
RUN pip install -r requirements.txt

# Install gunicorn
# RUN pip install gunicorn

# Copy function code
COPY . ${LAMBDA_TASK_ROOT}

# Task to be run:
CMD [ "flask", "run", "-h", "0.0.0.0", "-p", "5000" ]