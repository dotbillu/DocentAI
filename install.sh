#!/bin/bash
set -e
trap "kill 0" EXIT

echo "Starting backend setup"
(
  cd backend || exit 1

  if [ ! -d "myenv" ]; then
    python -m venv myenv
  fi

  ./myenv/bin/python -m pip install --upgrade pip
  ./myenv/bin/pip install -r requirements.txt
) &

sleep 2

echo "Starting frontend setup"
(
  cd frontend || exit 1
  npm install
) &

wait
