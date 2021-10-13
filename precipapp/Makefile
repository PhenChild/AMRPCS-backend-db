#!/bin/sh
n=1
all: model

basic-model:
	sequelize model:generate --name $(name) user --attributes email:string
migrate:
	sequelize db:migrate
down:
	sequelize db:migrate:undo
down-all:
	sequelize db:migrate:undo:all
down-all-to:
	sequelize db:migrate:undo:all --to $(limit)
model:
	n=1;\
	for a in $(attrs) ; do \
		if [ $$n = 1 ]; then\
			att=`expr $$a:string`;\
		else\
        	att=`expr $$att","$$a:string`; \
		fi;\
		n=`expr $$n+1`;\
    done;\
	echo $$att;\
	sequelize model:generate --name $(name) --attributes $$att
migration-file:
	sequelize migration:create --name $(name)
init:
	npm start
#for local tunel, install globally:  npm install -g localtunnel
ltunnel:
	lt --port 3000 --subdomain ciifen