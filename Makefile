.PHONY:*
prodNodeEnv:=$(shell cat Makefile.rsync.env.private 2>&1)

gulp:
	@ gulp $(RUN_ARGS)
build:
	@ gulp build $(RUN_ARGS)

ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build gulp))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif