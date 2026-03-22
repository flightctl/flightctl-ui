# FlightCtl UI Makefile for EL9/EL10 parallel support

# Default OS - can be overridden with OS=el10
OS ?= el9
RHEL_OS = $(shell echo $(OS) | sed 's/el/rhel/')

# Container registry settings
REGISTRY ?= quay.io
REGISTRY_OWNER ?= flightctl

# Version/tag settings
SOURCE_GIT_TAG ?= $(shell git describe --long --tags --exclude latest --dirty)
VERSION ?= $(shell echo $(SOURCE_GIT_TAG) | sed 's/^v//')

# Image names
STANDALONE_IMAGE_NAME = flightctl-ui
OCP_IMAGE_NAME = flightctl-ocp-ui

# Build targets
.PHONY: help build-ui build-ocp-ui build-all clean

help:	## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build-ui: packaging/images/$(OS)/Containerfile ## Build standalone UI container for current OS (default: el9)
	@echo "Building standalone UI container for $(OS)/$(RHEL_OS)..."
	podman build \
		-f packaging/images/$(OS)/Containerfile \
		-t localhost/$(STANDALONE_IMAGE_NAME):latest \
		-t localhost/$(STANDALONE_IMAGE_NAME)-$(RHEL_OS):latest \
		-t $(REGISTRY)/$(REGISTRY_OWNER)/$(STANDALONE_IMAGE_NAME):$(VERSION) \
		-t $(REGISTRY)/$(REGISTRY_OWNER)/$(STANDALONE_IMAGE_NAME)-$(RHEL_OS):$(VERSION) \
		.

build-ocp-ui: packaging/images/$(OS)/Containerfile.ocp ## Build OCP UI container for current OS (default: el9)
	@echo "Building OCP UI container for $(OS)/$(RHEL_OS)..."
	podman build \
		-f packaging/images/$(OS)/Containerfile.ocp \
		-t localhost/$(OCP_IMAGE_NAME):latest \
		-t localhost/$(OCP_IMAGE_NAME)-$(RHEL_OS):latest \
		-t $(REGISTRY)/$(REGISTRY_OWNER)/$(OCP_IMAGE_NAME):$(VERSION) \
		-t $(REGISTRY)/$(REGISTRY_OWNER)/$(OCP_IMAGE_NAME)-$(RHEL_OS):$(VERSION) \
		.

build-ui-el9: ## Build standalone UI container for EL9
	$(MAKE) build-ui OS=el9

build-ui-el10: ## Build standalone UI container for EL10
	$(MAKE) build-ui OS=el10

build-ocp-ui-el9: ## Build OCP UI container for EL9
	$(MAKE) build-ocp-ui OS=el9

build-ocp-ui-el10: ## Build OCP UI container for EL10
	$(MAKE) build-ocp-ui OS=el10

build-all: build-ui-el9 build-ui-el10 build-ocp-ui-el9 build-ocp-ui-el10 ## Build all UI containers (both OS variants)

clean: ## Clean up built containers
	@echo "Cleaning up UI containers..."
	podman rmi -f localhost/$(STANDALONE_IMAGE_NAME):latest localhost/$(STANDALONE_IMAGE_NAME)-rhel9:latest localhost/$(STANDALONE_IMAGE_NAME)-rhel10:latest 2>/dev/null || true
	podman rmi -f localhost/$(OCP_IMAGE_NAME):latest localhost/$(OCP_IMAGE_NAME)-rhel9:latest localhost/$(OCP_IMAGE_NAME)-rhel10:latest 2>/dev/null || true
	@echo "Cleanup complete"

# Development targets
dev: ## Run standalone UI in development mode
	npm run dev

dev-ocp: ## Run OCP plugin UI in development mode
	npm run dev:ocp

install: ## Install npm dependencies
	npm ci

build: ## Build UI applications (npm build)
	npm run build

build-ocp: ## Build OCP plugin application
	npm run build:ocp

lint: ## Run linting
	npm run lint

# Show current configuration
show-config: ## Show current build configuration
	@echo "OS: $(OS)"
	@echo "RHEL_OS: $(RHEL_OS)"
	@echo "VERSION: $(VERSION)"
	@echo "REGISTRY: $(REGISTRY)"
	@echo "REGISTRY_OWNER: $(REGISTRY_OWNER)"