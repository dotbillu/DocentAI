#!/bin/bash
trap "kill 0" EXIT

echo "Starting backend"
(cd backend && source myenv/bin/activate && uvicorn main:app --reload) &
sleep 2

echo "Starting frontend"
(cd frontend && npm run dev) &
wait

