# Release Makefile

# Paths relative to the Release directory
ROOT_DIR = ..
VENV_NAME = $(ROOT_DIR)/ts_venv
PYTHON_VENV = $(VENV_NAME)/bin/python
PIP = $(VENV_NAME)/bin/pip

.PHONY: help run setup

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Ensure virtual environment and dependencies are installed
	@if [ ! -d "$(VENV_NAME)" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv $(VENV_NAME); \
	fi
	@echo "Installing/Updating dependencies..."
	$(PIP) install --upgrade pip
	$(PIP) install -e $(ROOT_DIR)
	@echo "Setup complete."

run: setup ## Run the TeamSpeak Accessibility Injector
	@echo "Running TeamSpeak Accessibility Injector..."
	$(PYTHON_VENV) $(ROOT_DIR)/src/ts_master.py
