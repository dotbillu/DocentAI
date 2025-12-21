#!/bin/bash
trap "kill 0" EXIT
echo "Starting backend"
(
  cd backend || exit 1
  ./myenv/bin/python -m uvicorn main:app --reload
) &
sleep 2
echo "Starting frontend"
(
  cd frontend || exit 1
  npm run dev
) &
wait
