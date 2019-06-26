.PHONY:*
prodNodeEnv:=$(shell cat Makefile.rsync.env.private 2>&1)

start:
	@ npm start
push:
	@ bash tools/local/index.sh push $(RUN_ARGS)

ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build push lc))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif