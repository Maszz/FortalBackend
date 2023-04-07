
DELAY=30

docker-compose --file dev-compose.yml up -d --build

echo "****** Waiting for ${DELAY} seconds for containers to go up ******"
sleep $DELAY

docker exec mongo1 /scripts/rs-init.sh

echo "Starting Push schema to mongo database"

# docker exec sf341backend /bin/sh -c "cd /usr/src/app && npx prisma db push"