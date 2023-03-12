#!/bin/bash

if [ "${DATABASE_URL}" ]; then
  if [[ "${DATABASE_URL}" == *\?* ]]
  then
    export DATABASE_URL="${DATABASE_URL}&connection_limit=25&pool_timeout=15"
  else
    export DATABASE_URL="${DATABASE_URL}?connection_limit=25&pool_timeout=15"
  fi
  
fi

exec pnpm start