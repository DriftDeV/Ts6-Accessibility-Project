# Makefile for Ts6-Accessibility-Project

VENV_NAME = ts_venv
PYTHON = python3
PIP = $(VENV_NAME)/bin/pip
PYTHON_VENV = $(VENV_NAME)/bin/python

.PHONY: all setup run clean

all: setup

setup: $(VENV_NAME)/bin/activate

$(VENV_NAME)/bin/activate: pyproject.toml
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install --upgrade pip
	$(PIP) install -e .
	@echo "Setup complete."

run: setup
	@echo "Running TeamSpeak Accessibility Injector..."
	$(PYTHON_VENV) src/ts_master.py

clean:
	@echo "Cleaning up..."
	rm -rf $(VENV_NAME)
	rm -rf build dist *.egg-info
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Clean complete."
