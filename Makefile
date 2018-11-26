.PHONY:*
prodNodeEnv:=$(shell cat Makefile.rsync.env.private 2>&1)

gulp:
	@ gulp
build:
	@ bash tools/script-tools/index.sh build $(RUN_ARGS)
push:
	@ bash tools/script-tools/index.sh push $(RUN_ARGS)
test:
	@ bash tools/script-tools/index.sh test $(RUN_ARGS)
now:
	@ # make now -- XXX
	@ # will do now -t token XXXX
	@ bash tools/script-tools/index.sh now $(RUN_ARGS)

ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build push now copy))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif