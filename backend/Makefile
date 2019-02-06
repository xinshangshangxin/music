.PHONY:*
prodNodeEnv:=$(shell cat Makefile.rsync.env.private 2>&1)

build:
	@ bash tools/local/index.sh build $(RUN_ARGS)
push:
	@ bash tools/local/index.sh push $(RUN_ARGS)
test:
	@ bash tools/local/index.sh test $(RUN_ARGS)
now:
	@ # make now -- XXX
	@ # will do now -t token XXXX
	@ bash tools/local/index.sh now $(RUN_ARGS)
lc:
	@ # make now -- XXX
	@ # will do now -t token XXXX
	@ bash tools/local/index.sh leancloud $(RUN_ARGS)


ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build push now lc))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif