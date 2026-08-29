# Makefile for Ts6-Accessibility-Project

VENV_NAME = ts_venv
PYTHON = python3
PIP = $(VENV_NAME)/bin/pip
PYTHON_VENV = $(VENV_NAME)/bin/python

.PHONY: all setup run clean help debug dump-dom dump-resources inject launch-debug

all: setup

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: $(VENV_NAME)/bin/activate ## Create virtual environment and install dependencies

$(VENV_NAME)/bin/activate: pyproject.toml
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install --upgrade pip
	$(PIP) install -e .
	@echo "Setup complete."

run: setup ## Run the main TeamSpeak Accessibility Injector
	@echo "Running TeamSpeak Accessibility Injector..."
	$(PYTHON_VENV) src/ts_master.py

debug: setup ## Launch TeamSpeak in debug mode
	@echo "Launching TeamSpeak in debug mode..."
	$(PYTHON_VENV) src/debug_teamspeak.py

dump-dom: setup ## Dump current TeamSpeak DOM to file
	@echo "Dumping DOM..."
	$(PYTHON_VENV) src/dump_dom.py

dump-resources: setup ## Dump loaded scripts and resources
	@echo "Dumping resources..."
	$(PYTHON_VENV) src/dump_resources.py

inject: setup ## Inject accessibility scripts
	@echo "Injecting scripts..."
	$(PYTHON_VENV) src/injector.py

launch-debug: setup ## Launch TeamSpeak with debug flags (macOS helper)
	@echo "Launching TeamSpeak (Debug Flags only)..."
	$(PYTHON_VENV) src/launch_debug_only.py

clean: ## Remove virtual environment and build artifacts
	@echo "Cleaning up..."
	rm -rf $(VENV_NAME)
	rm -rf build dist *.egg-info
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Clean complete."
