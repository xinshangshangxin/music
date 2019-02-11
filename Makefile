.PHONY:*

push:
	@ bash devops/local/index.sh push $(RUN_ARGS)
pull:
	@ bash devops/local/index.sh pull $(RUN_ARGS)


ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),push pull))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif